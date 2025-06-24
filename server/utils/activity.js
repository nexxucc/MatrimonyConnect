const Activity = require('../models/Activity');

/**
 * Log a general user activity
 * @param {Object} params - Activity parameters
 * @returns {Promise<void>}
 */
async function logActivity({ user, type, target, targetModel, description, meta, deviceInfo }) {
    try {
        await Activity.create({
            user,
            type,
            target,
            targetModel,
            description,
            meta,
            deviceInfo
        });
    } catch (err) {
        // Optionally log error
        console.error('Activity log error:', err);
    }
}

/**
 * Log a profile view activity
 * @param {Object} params - Parameters for profile view
 * @returns {Promise<void>}
 */
async function logProfileView({ viewerId, profileId, profileUserId, deviceInfo }) {
    return logActivity({
        user: viewerId,
        type: 'profile_view',
        target: profileId,
        targetModel: 'Profile',
        description: 'Viewed a profile',
        meta: {
            profileUserId
        },
        deviceInfo
    });
}

/**
 * Log an interest activity
 * @param {Object} params - Parameters for interest activity
 * @returns {Promise<void>}
 */
async function logInterestActivity({ senderId, receiverId, interestId, action, deviceInfo }) {
    const types = {
        sent: 'interest_sent',
        accepted: 'interest_accepted',
        declined: 'interest_declined',
        received: 'interest_received'
    };

    // Log for the sender
    if (action === 'sent') {
        await logActivity({
            user: senderId,
            type: types[action],
            target: interestId,
            targetModel: 'Interest',
            description: 'Sent interest to another user',
            meta: { receiverId },
            deviceInfo
        });
    }

    // Log for the receiver (when interest is sent)
    if (action === 'sent') {
        await logActivity({
            user: receiverId,
            type: 'interest_received',
            target: interestId,
            targetModel: 'Interest',
            description: 'Received interest from another user',
            meta: { senderId }
        });
    }

    // Log when interest is accepted or declined
    if (action === 'accepted' || action === 'declined') {
        await logActivity({
            user: receiverId,
            type: types[action],
            target: interestId,
            targetModel: 'Interest',
            description: `${action.charAt(0).toUpperCase() + action.slice(1)} interest from another user`,
            meta: { senderId },
            deviceInfo
        });

        // Also log an activity for the original sender to know their interest was responded to
        await logActivity({
            user: senderId,
            type: `interest_${action}`,
            target: interestId,
            targetModel: 'Interest',
            description: `Your interest was ${action} by another user`,
            meta: { receiverId }
        });
    }
}

/**
 * Log a chat message activity
 * @param {Object} params - Parameters for chat activity
 * @returns {Promise<void>}
 */
async function logChatActivity({ senderId, receiverId, chatId, messageId, deviceInfo }) {
    // Log for sender
    await logActivity({
        user: senderId,
        type: 'chat_message',
        target: chatId,
        targetModel: 'Chat',
        description: 'Sent a message',
        meta: {
            receiverId,
            messageId
        },
        deviceInfo
    });

    // Log for receiver
    await logActivity({
        user: receiverId,
        type: 'chat_message',
        target: chatId,
        targetModel: 'Chat',
        description: 'Received a message',
        meta: {
            senderId,
            messageId
        }
    });
}

/**
 * Log a search activity
 * @param {Object} params - Parameters for search activity
 * @returns {Promise<void>}
 */
async function logSearchActivity({ userId, searchParams, resultCount, deviceInfo }) {
    return logActivity({
        user: userId,
        type: 'search',
        description: 'Performed a search',
        meta: {
            searchParams,
            resultCount
        },
        deviceInfo
    });
}

/**
 * Log a subscription activity
 * @param {Object} params - Parameters for subscription activity
 * @returns {Promise<void>}
 */
async function logSubscriptionActivity({ userId, planName, duration, amount, paymentId, deviceInfo }) {
    return logActivity({
        user: userId,
        type: 'subscription',
        target: paymentId,
        targetModel: 'Payment',
        description: `Subscribed to ${planName} plan`,
        meta: {
            planName,
            duration,
            amount
        },
        deviceInfo
    });
}

/**
 * Log a profile update activity
 * @param {Object} params - Parameters for profile update activity
 * @returns {Promise<void>}
 */
async function logProfileUpdateActivity({ userId, profileId, updatedFields, deviceInfo }) {
    return logActivity({
        user: userId,
        type: 'profile_update',
        target: profileId,
        targetModel: 'Profile',
        description: 'Updated profile information',
        meta: {
            updatedFields
        },
        deviceInfo
    });
}

/**
 * Log a photo upload activity
 * @param {Object} params - Parameters for photo upload activity
 * @returns {Promise<void>}
 */
async function logPhotoActivity({ userId, profileId, photoCount, action, deviceInfo }) {
    return logActivity({
        user: userId,
        type: action === 'upload' ? 'photo_upload' : 'photo_delete',
        target: profileId,
        targetModel: 'Profile',
        description: action === 'upload' ? 'Uploaded photos' : 'Deleted photos',
        meta: {
            photoCount
        },
        deviceInfo
    });
}

/**
 * Get recent activities for a user
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of activities to return
 * @returns {Promise<Array>} - Array of activities
 */
async function getRecentActivities(userId, limit = 10) {
    try {
        return await Activity.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('target')
            .lean();
    } catch (err) {
        console.error('Get recent activities error:', err);
        return [];
    }
}

/**
 * Get activities involving a user (as target)
 * @param {string} userId - User ID
 * @param {string} type - Type of activity
 * @param {number} limit - Maximum number of activities
 * @returns {Promise<Array>} - Array of activities
 */
async function getActivitiesInvolvingUser(userId, type, limit = 10) {
    try {
        return await Activity.find({
            target: userId,
            targetModel: 'User',
            type
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('user', 'name')
            .lean();
    } catch (err) {
        console.error('Get activities involving user error:', err);
        return [];
    }
}

module.exports = {
    logActivity,
    logProfileView,
    logInterestActivity,
    logChatActivity,
    logSearchActivity,
    logSubscriptionActivity,
    logProfileUpdateActivity,
    logPhotoActivity,
    getRecentActivities,
    getActivitiesInvolvingUser
};