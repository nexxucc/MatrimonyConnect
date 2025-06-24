const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'login', 'logout', 'registration', 'email_verification', 'phone_verification',
            'profile_create', 'profile_update', 'photo_upload', 'photo_delete',
            'interest_sent', 'interest_received', 'interest_accepted', 'interest_declined',
            'chat_message_sent', 'chat_message_received', 'chat_started',
            'payment', 'subscription_change', 'subscription_renewal', 'subscription_cancel',
            'report_sent', 'profile_boost', 'profile_featured',
            'favorite_add', 'favorite_remove', 'block_user', 'unblock_user',
            'search_performed', 'advanced_search', 'saved_search',
            'profile_view', 'contact_view', 'success_story_submitted',
            'admin_action', 'account_deactivate', 'account_reactivate',
            'password_reset_request', 'password_change', 'other'
        ],
        required: true
    },
    target: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'targetModel'
    },
    targetModel: {
        type: String,
        enum: ['User', 'Profile', 'Chat', 'Payment', 'Interest', null]
    },
    description: {
        type: String
    },
    meta: {
        type: Object
    },
    deviceInfo: {
        ipAddress: String,
        userAgent: String,
        device: String,
        browser: String,
        location: String
    },
    status: {
        read: {
            type: Boolean,
            default: false
        },
        notified: {
            type: Boolean,
            default: false
        },
        archived: {
            type: Boolean,
            default: false
        }
    },
    importance: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for better performance
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ target: 1, type: 1 });
activitySchema.index({ type: 1 });
activitySchema.index({ createdAt: 1 });
activitySchema.index({ 'status.read': 1 });

// Static method to track user activity
activitySchema.statics.trackActivity = async function (data) {
    try {
        const activity = new this({
            user: data.userId,
            type: data.type,
            target: data.targetId || null,
            targetModel: data.targetModel || null,
            description: data.description || '',
            meta: data.meta || {},
            deviceInfo: {
                ipAddress: data.ipAddress || null,
                userAgent: data.userAgent || null,
                device: data.device || null,
                browser: data.browser || null,
                location: data.location || null
            },
            importance: data.importance || 'medium'
        });

        return await activity.save();
    } catch (error) {
        console.error('Error tracking activity:', error);
        return null;
    }
};

// Get recent activity for a user
activitySchema.statics.getRecentActivity = async function (userId, limit = 10) {
    return this.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('target')
        .lean();
};

// Mark activities as read
activitySchema.statics.markAsRead = async function (userId, activityIds = []) {
    if (activityIds.length > 0) {
        return this.updateMany(
            { _id: { $in: activityIds }, user: userId },
            { $set: { 'status.read': true } }
        );
    } else {
        return this.updateMany(
            { user: userId, 'status.read': false },
            { $set: { 'status.read': true } }
        );
    }
};

// Get unread activity count for a user
activitySchema.statics.getUnreadCount = async function (userId) {
    return this.countDocuments({ user: userId, 'status.read': false });
};

module.exports = mongoose.model('Activity', activitySchema);