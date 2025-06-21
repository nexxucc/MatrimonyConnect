const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { logActivity } = require('../utils/activity');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Dummy create order
router.post('/create-order', auth, async (req, res) => {
    const { amount, currency = 'INR' } = req.body;
    res.json({ orderId: 'dummy_order_' + Date.now(), amount: amount * 100, currency });
});

// Dummy verify payment
router.post('/verify', auth, async (req, res) => {
    const { plan, amount } = req.body;
    // Save dummy payment
    await Payment.create({
        user: req.user._id,
        amount,
        currency: 'INR',
        status: 'success',
        orderId: 'dummy_order',
        paymentId: 'dummy_payment',
        signature: 'dummy_signature',
        plan
    });
    // Update user subscription
    req.user.subscription = {
        plan,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
    };
    await req.user.save();
    res.json({ message: 'Dummy payment verified and subscription activated' });
});

// Create Payment Intent
router.post('/create-payment-intent', auth, async (req, res) => {
    try {
        const { plan, paymentMethod } = req.body;

        // Validate plan
        const plans = {
            basic: { amount: 99900, currency: 'inr', name: 'Basic Plan' },
            premium: { amount: 199900, currency: 'inr', name: 'Premium Plan' }
        };

        if (!plans[plan]) {
            return res.status(400).json({ message: 'Invalid plan' });
        }

        const planDetails = plans[plan];

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: planDetails.amount,
            currency: planDetails.currency,
            metadata: {
                userId: req.user._id.toString(),
                plan: plan
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            amount: planDetails.amount,
            currency: planDetails.currency
        });

    } catch (error) {
        console.error('Create payment intent error:', error);
        res.status(500).json({ message: 'Failed to create payment intent' });
    }
});

// Confirm Payment
router.post('/confirm', auth, async (req, res) => {
    try {
        const { paymentIntentId, plan, paymentMethod } = req.body;

        // Retrieve payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ message: 'Payment not completed' });
        }

        // Create payment record
        const payment = new Payment({
            user: req.user._id,
            plan: plan,
            amount: paymentIntent.amount / 100, // Convert from cents
            currency: paymentIntent.currency,
            paymentMethod: paymentMethod,
            paymentStatus: 'completed',
            transactionId: paymentIntent.id,
            gatewayResponse: paymentIntent,
            subscriptionStart: new Date(),
            subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            isActive: true
        });

        await payment.save();

        // Update user subscription
        const user = await User.findById(req.user._id);
        user.subscription = {
            plan: plan,
            startDate: payment.subscriptionStart,
            endDate: payment.subscriptionEnd,
            isActive: true
        };
        await user.save();

        await logActivity({ user: req.user._id, type: 'payment', target: payment._id, targetModel: 'Payment', description: 'Payment made' });

        res.json({
            message: 'Payment confirmed successfully',
            payment,
            subscription: user.subscription
        });

    } catch (error) {
        console.error('Confirm payment error:', error);
        res.status(500).json({ message: 'Failed to confirm payment' });
    }
});

// Get Payment History
router.get('/history', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const payments = await Payment.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Payment.countDocuments({ user: req.user._id });

        res.json({
            payments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalResults: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({ message: 'Failed to get payment history' });
    }
});

// Get Current Subscription
router.get('/subscription', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.json({
            subscription: user.subscription
        });

    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({ message: 'Failed to get subscription' });
    }
});

// Cancel Subscription
router.post('/cancel', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user.subscription.isActive) {
            return res.status(400).json({ message: 'No active subscription to cancel' });
        }

        // Update subscription
        user.subscription.isActive = false;
        await user.save();

        res.json({
            message: 'Subscription cancelled successfully',
            subscription: user.subscription
        });

    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ message: 'Failed to cancel subscription' });
    }
});

// Webhook for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', paymentIntent.id);
            break;

        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('Payment failed:', failedPayment.id);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

module.exports = router; 