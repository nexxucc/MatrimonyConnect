const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plan: {
        type: String,
        enum: ['basic', 'premium'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    paymentMethod: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'wallet'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        unique: true
    },
    gatewayResponse: {
        type: mongoose.Schema.Types.Mixed
    },
    subscriptionStart: Date,
    subscriptionEnd: Date,
    isActive: {
        type: Boolean,
        default: false
    },
    refundReason: String,
    refundedAt: Date,
    orderId: { type: String },
    paymentId: { type: String },
    signature: { type: String },
}, {
    timestamps: true
});

// Indexes for better query performance
paymentSchema.index({ user: 1, paymentStatus: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ paymentStatus: 1, createdAt: 1 });
paymentSchema.index({ subscriptionEnd: 1, isActive: 1 });

module.exports = mongoose.model('Payment', paymentSchema); 