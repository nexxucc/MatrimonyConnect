const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const {
    sendUserOTP,
    sendWhatsAppOTP,
    verifyOTP,
    isOTPValid,
    checkRateLimit,
    generateVerificationToken
} = require('../utils/otp');
const {
    sendEmail,
    sendEmailVerificationOtp
} = require('../utils/email');
const { logActivity } = require('../utils/activity');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Send OTP for verification (email or phone)
router.post('/', [
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isMobilePhone('any'),
    body('method').optional().isIn(['sms', 'whatsapp', 'email']).default('sms'),
    body('type').optional().isIn(['verification', 'password_reset', 'login']).default('verification')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let { email, phone, method, type } = req.body;

        if (!email && !phone) {
            return res.status(400).json({ message: 'Email or phone is required' });
        }

        // Check if method is valid for the given contact info
        if ((method === 'email' && !email) || ((method === 'sms' || method === 'whatsapp') && !phone)) {
            return res.status(400).json({
                message: `Cannot send ${method} OTP without ${method === 'email' ? 'email address' : 'phone number'}`
            });
        }

        // Check if WhatsApp method is enabled
        if (method === 'whatsapp' && process.env.ENABLE_WHATSAPP_OTP !== 'true') {
            // Fallback to SMS if WhatsApp is not enabled
            console.log('WhatsApp OTP disabled, falling back to SMS');
            method = 'sms';
        }

        // Get client IP address for rate limiting
        const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const identifier = email || phone || clientIp;

        // Check rate limit (5 attempts per hour)
        if (!checkRateLimit(identifier, 5, 60)) {
            return res.status(429).json({
                message: 'Too many OTP requests. Please try again later.',
                retryAfter: 60 // minutes
            });
        }

        let user;
        if (phone) {
            user = await User.findOne({ phone });
            if (!user) {
                return res.status(404).json({ message: 'User with this phone not found' });
            }

            // Choose method for sending OTP
            if (method === 'whatsapp') {
                await sendUserOTP(user, 'phone', sendWhatsAppOTP);
            } else {
                // Default to SMS
                await sendUserOTP(user, 'phone', sendWhatsAppOTP);
            }

            // Log activity
            await logActivity({
                user: user._id,
                type: type === 'password_reset' ? 'password_reset_request' : 'phone_verification',
                description: `OTP sent to phone via ${method}`,
                meta: { phone: phone.slice(-4) } // Store only last 4 digits for security
            });
        } else if (email) {
            user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User with this email not found' });
            }

            // Send OTP via email
            const otp = await sendUserOTP(user, 'email', async (to, otp) => {
                if (type === 'password_reset') {
                    await sendEmail(
                        to,
                        'Password Reset Code - Matrimony Connect',
                        `Your password reset code is: ${otp}. Valid for 10 minutes.`
                    );
                } else {
                    // Use enhanced email template for verification
                    await sendEmailVerificationOtp(to, user.name, otp);
                }
            });

            // Log activity
            await logActivity({
                user: user._id,
                type: type === 'password_reset' ? 'password_reset_request' : 'email_verification',
                description: 'OTP sent to email',
                meta: { email: email.substring(0, 3) + '...' + email.substring(email.indexOf('@')) }
            });
        }

        // Return masked identifiers for UI
        const maskedPhone = phone ? `${phone.substring(0, 4)}****${phone.substring(phone.length - 2)}` : null;
        const maskedEmail = email ? `${email.substring(0, 3)}...${email.substring(email.indexOf('@'))}` : null;

        res.json({
            message: 'OTP sent successfully',
            sent_to: phone ? maskedPhone : maskedEmail,
            method: method,
            expiresIn: '10 minutes'
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
});

// Verify OTP
router.post('/verify', [
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isMobilePhone('any'),
    body('otp').notEmpty().withMessage('OTP is required'),
    body('type').optional().isIn(['verification', 'password_reset', 'login']).default('verification')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, phone, otp, type } = req.body;

        if (!email && !phone) {
            return res.status(400).json({ message: 'Email or phone is required' });
        }

        let user;
        let isValid = false;
        let otpField, expiresAtField;

        if (phone) {
            user = await User.findOne({ phone });
            otpField = 'phoneOtp';
            expiresAtField = 'phoneOtpExpiresAt';
        } else {
            user = await User.findOne({ email });
            otpField = 'emailOtp';
            expiresAtField = 'emailOtpExpiresAt';
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if OTP is valid and not expired
        if (user[otpField] && isOTPValid(user[expiresAtField])) {
            isValid = verifyOTP(user[otpField], otp);
        }

        if (!isValid) {
            // Log failed attempt
            await logActivity({
                user: user._id,
                type: 'verification_failed',
                description: `Failed OTP verification for ${phone ? 'phone' : 'email'}`
            });

            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Clear OTP after successful verification
        user[otpField] = undefined;
        user[expiresAtField] = undefined;

        // If this was for verification purposes, mark as verified
        if (type === 'verification') {
            if (phone) {
                // For phone verification
                const profile = await require('../models/Profile').findOne({ userId: user._id });
                if (profile) {
                    profile.verification.phoneVerified = true;
                    await profile.save();
                }
            } else {
                // For email verification
                user.isVerified = true;
                const profile = await require('../models/Profile').findOne({ userId: user._id });
                if (profile) {
                    profile.verification.emailVerified = true;
                    await profile.save();
                }
            }
        }

        await user.save();

        // Log successful verification
        await logActivity({
            user: user._id,
            type: phone ? 'phone_verified' : 'email_verified',
            description: `Successfully verified ${phone ? 'phone' : 'email'}`
        });

        // Generate auth token for login-type verification
        let authToken = null;
        if (type === 'login' || type === 'password_reset') {
            const jwt = require('jsonwebtoken');
            authToken = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
        }

        res.json({
            message: 'OTP verified successfully',
            verified: true,
            ...(authToken && { token: authToken }),
            ...(type === 'password_reset' && {
                resetToken: generateVerificationToken(),
                userId: user._id
            })
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ message: 'Failed to verify OTP' });
    }
});

// Resend OTP (with rate limiting)
router.post('/resend', [
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isMobilePhone(),
    body('method').optional().isIn(['sms', 'whatsapp', 'email']).default('sms')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, phone, method } = req.body;

        if (!email && !phone) {
            return res.status(400).json({ message: 'Email or phone is required' });
        }

        // Get client IP address for rate limiting
        const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const identifier = email || phone || clientIp;

        // More strict rate limit for resends (3 attempts per hour)
        if (!checkRateLimit(identifier, 3, 60)) {
            return res.status(429).json({
                message: 'Too many resend attempts. Please try again later.',
                retryAfter: 60 // minutes
            });
        }

        // Simply call the original send endpoint logic
        let user;
        if (phone) {
            user = await User.findOne({ phone });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (method === 'whatsapp') {
                await sendUserOTP(user, 'phone', sendWhatsAppOTP);
            } else {
                // Default to SMS
                await sendUserOTP(user, 'phone', sendWhatsAppOTP);
            }
        } else {
            user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Send OTP via email with enhanced template
            await sendUserOTP(user, 'email', async (to, otp) => {
                await sendEmailVerificationOtp(to, user.name, otp);
            });
        }

        res.json({
            message: 'OTP resent successfully',
            expiresIn: '10 minutes'
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ message: 'Failed to resend OTP' });
    }
});

// Check OTP status (for UX improvements)
router.get('/status', auth, async (req, res) => {
    try {
        const user = req.user;

        const emailOtpStatus = user.emailOtp && isOTPValid(user.emailOtpExpiresAt);
        const phoneOtpStatus = user.phoneOtp && isOTPValid(user.phoneOtpExpiresAt);

        res.json({
            email: {
                otpSent: !!user.emailOtp,
                otpValid: !!emailOtpStatus,
                ...(user.emailOtpExpiresAt && { expiresAt: user.emailOtpExpiresAt })
            },
            phone: {
                otpSent: !!user.phoneOtp,
                otpValid: !!phoneOtpStatus,
                ...(user.phoneOtpExpiresAt && { expiresAt: user.phoneOtpExpiresAt })
            },
            isEmailVerified: user.isVerified,
            isPhoneVerified: false // This would come from the profile if implemented
        });

    } catch (error) {
        console.error('OTP status check error:', error);
        res.status(500).json({ message: 'Failed to check OTP status' });
    }
});

module.exports = router;
