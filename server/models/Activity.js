const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: [
            'login', 'profile_update', 'interest_sent', 'interest_received',
            'chat_message', 'payment', 'subscription', 'report', 'profile_boost',
            'favorite', 'search', 'other'
        ],
        required: true
    },
    target: { type: mongoose.Schema.Types.ObjectId, refPath: 'targetModel' },
    targetModel: { type: String },
    description: { type: String },
    meta: { type: Object },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema); 