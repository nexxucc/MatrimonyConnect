const express = require('express');
const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const Interest = require('../models/Interest');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { auth, premiumAuth } = require('../middleware/auth');
const { logActivity } = require('../utils/activity');
const { sendChatNotification } = require('../utils/email');

// Helper functions to reduce cognitive complexity
const findContactRequestMessage = (chat, messageId) => {
    const messageIndex = chat.messages.findIndex(
        m => m._id.toString() === messageId &&
            m.messageType === 'contact_request'
    );
    return messageIndex;
};

const generateContactInfo = async (userId) => {
    const userProfile = await Profile.findOne({ userId });
    const user = await User.findById(userId);

    let contactInfo = 'Contact Information:\n';

    if (user.phone) contactInfo += `Phone: ${user.phone}\n`;
    if (user.email) contactInfo += `Email: ${user.email}\n`;
    if (userProfile.contactInfo?.whatsapp) contactInfo += `WhatsApp: ${userProfile.contactInfo.whatsapp}\n`;
    if (userProfile.contactInfo?.telegram) contactInfo += `Telegram: ${userProfile.contactInfo.telegram}\n`;
    if (userProfile.contactInfo?.alternatePhone) contactInfo += `Alternate Phone: ${userProfile.contactInfo.alternatePhone}\n`;

    return contactInfo;
};

const createMessage = (userId, content, type) => {
    return {
        sender: userId,
        content,
        messageType: type,
        timestamp: new Date(),
        readBy: [userId]
    };
};

const createLastMessage = (userId, content, type) => {
    return {
        sender: userId,
        content,
        timestamp: new Date(),
        messageType: type
    };
};

const processContactRequest = async (chat, messageId, user, accept) => {
    const messageIndex = findContactRequestMessage(chat, messageId);

    if (messageIndex === -1) {
        throw new Error('Contact request not found');
    }

    // Update message status
    chat.messages[messageIndex].metadata.contactRequestStatus = accept ? 'accepted' : 'rejected';

    if (accept) {
        const contactInfo = await generateContactInfo(user._id);
        const contactMessage = createMessage(user._id, contactInfo, 'contact_info');
        chat.messages.push(contactMessage);
        chat.lastMessage = createLastMessage(user._id, 'Shared contact information', 'contact_info');
    } else {
        const rejectionMessage = createMessage(
            user._id,
            'I declined to share contact information at this time',
            'text'
        );
        chat.messages.push(rejectionMessage);
        chat.lastMessage = createLastMessage(
            user._id,
            'Declined to share contact information',
            'text'
        );
    }
};

const updateChatActivity = async (userId, chatId, type, metadata = {}) => {
    await logActivity({
        userId,
        activityType: type,
        entityType: 'chat',
        entityId: chatId,
        metadata
    });
};

const router = express.Router();

// Get Chat List
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        const skip = (page - 1) * limit;

        const query = {
            participants: req.user._id,
            isActive: true
        };

        if (unreadOnly === 'true') {
            query.unreadMessages = { $gt: 0 };
        }

        const chats = await Chat.find(query)
            .populate({
                path: 'participants',
                select: 'email phone',
                model: 'User'
            })
            .populate({
                path: 'participants',
                select: 'basicInfo photos',
                model: 'Profile'
            })
            .sort({ 'lastMessage.timestamp': -1, updatedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Chat.countDocuments(query);
        const unreadCount = await Chat.countDocuments({
            participants: req.user._id,
            unreadMessages: { $gt: 0 }
        });

        res.json({
            chats,
            unreadCount,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalResults: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get chat list error:', error);
        res.status(500).json({ message: 'Failed to get chat list' });
    }
});

// Start a new chat
router.post('/start', premiumAuth, [
    body('userId').isMongoId().withMessage('Valid user ID is required'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId } = req.body;

        // Check if other user exists and has an approved profile
        const otherProfile = await Profile.findOne({
            userId: userId,
            isProfileApproved: true
        });

        if (!otherProfile) {
            return res.status(404).json({ message: 'User not found or profile not approved' });
        }

        // Check if users have matched interests or if premium
        const hasInterest = await Interest.findOne({
            $or: [
                { fromUser: req.user._id, toUser: userId, status: 'accepted' },
                { fromUser: userId, toUser: req.user._id, status: 'accepted' }
            ]
        });

        // Only premium users can start chats without interest match
        if (!hasInterest && !req.user.subscription?.isActive) {
            return res.status(403).json({
                message: 'You need to have an accepted interest or premium subscription to start chat'
            });
        }

        // Check if chat already exists
        const existingChat = await Chat.findOne({
            participants: { $all: [req.user._id, userId] },
            isActive: true
        });

        if (existingChat) {
            return res.json({
                message: 'Chat already exists',
                chatId: existingChat._id
            });
        }

        // Create new chat
        const newChat = new Chat({
            participants: [req.user._id, userId],
            creator: req.user._id,
            unreadCount: { [userId]: 0 }
        });

        await newChat.save();

        await logActivity({
            user: req.user._id,
            type: 'chat_started',
            target: newChat._id,
            targetModel: 'Chat',
            description: 'Chat started',
            targetUser: userId
        });

        res.status(201).json({
            message: 'Chat started successfully',
            chatId: newChat._id
        });
    } catch (error) {
        console.error('Start chat error:', error);
        res.status(500).json({ message: 'Failed to start chat' });
    }
});

// Get Chat Messages
router.get('/:chatId', premiumAuth, async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        const chat = await Chat.findOne({
            _id: req.params.chatId,
            participants: req.user._id
        })
            .populate({
                path: 'participants',
                select: 'email phone subscription',
                model: 'User'
            })
            .populate({
                path: 'participants',
                select: 'basicInfo photos',
                model: 'Profile'
            });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Get paginated messages
        const messages = chat.messages
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(skip, skip + parseInt(limit))
            .reverse(); // Display in chronological order

        const total = chat.messages.length;

        // Mark messages as read
        if (chat.unreadMessages > 0) {
            chat.messages.forEach(msg => {
                if (msg.sender.toString() !== req.user._id.toString() && !msg.readBy.includes(req.user._id)) {
                    msg.readBy.push(req.user._id);
                }
            });

            chat.unreadMessages = 0;
            await chat.save();

            await logActivity({
                user: req.user._id,
                type: 'chat_read',
                target: chat._id,
                targetModel: 'Chat',
                description: 'Chat messages read'
            });
        }

        res.json({
            chat: {
                ...chat.toObject(),
                messages: messages
            },
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalResults: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get chat messages error:', error);
        res.status(500).json({ message: 'Failed to get chat messages' });
    }
});

// Send Message
router.post('/:chatId/messages', premiumAuth, [
    body('content').notEmpty().isLength({ max: 1000 }),
    body('messageType').isIn(['text', 'image', 'contact_request']).withMessage('Invalid message type')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { content, messageType = 'text' } = req.body;
        const chat = await Chat.findOne({
            _id: req.params.chatId,
            participants: req.user._id,
            isActive: true
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Check if user is blocked
        const otherUserId = chat.participants.find(p => p.toString() !== req.user._id.toString());
        const userProfile = await Profile.findOne({ userId: otherUserId });

        if (userProfile && userProfile.blockedUsers.includes(req.user._id)) {
            return res.status(403).json({ message: 'You cannot send messages to this user' });
        }

        // Add message to chat
        const message = {
            sender: req.user._id,
            content,
            messageType,
            timestamp: new Date(),
            readBy: [req.user._id]
        };

        chat.messages.push(message);
        chat.lastMessage = {
            sender: req.user._id,
            content: content.length > 30 ? content.substring(0, 30) + '...' : content,
            timestamp: new Date(),
            messageType
        };

        // Increment unread count for other participants
        chat.unreadMessages = (chat.unreadMessages || 0) + 1;

        await chat.save();

        // Log activity
        await logActivity({
            user: req.user._id,
            type: 'chat_message',
            target: chat._id,
            targetModel: 'Chat',
            description: 'Message sent',
            targetUser: otherUserId
        });

        // Send email notification for the new message
        try {
            const recipient = await User.findById(otherUserId);
            const senderProfile = await Profile.findOne({ userId: req.user._id });

            if (recipient && senderProfile && recipient.notificationPreferences?.emailForMessages) {
                const senderName = `${senderProfile.basicInfo.firstName} ${senderProfile.basicInfo.lastName || ''}`;
                await sendChatNotification(
                    recipient.email,
                    senderName,
                    messageType === 'text' ? content : 'Sent you a message'
                );
            }
        } catch (emailError) {
            console.error('Failed to send chat notification email:', emailError);
        }

        res.json({
            message: 'Message sent successfully',
            chatMessage: message
        });

    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

// Archive/Delete Chat
router.delete('/:chatId', auth, async (req, res) => {
    try {
        const chat = await Chat.findOne({
            _id: req.params.chatId,
            participants: req.user._id
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Mark chat as inactive for this user only (soft delete)
        chat.isActive = false;
        await chat.save();

        await logActivity({
            user: req.user._id,
            type: 'chat_archived',
            target: chat._id,
            targetModel: 'Chat',
            description: 'Chat archived'
        });

        res.json({ message: 'Chat archived successfully' });
    } catch (error) {
        console.error('Archive chat error:', error);
        res.status(500).json({ message: 'Failed to archive chat' });
    }
});

// Get chat stats
router.get('/stats/summary', auth, async (req, res) => {
    try {
        const totalChats = await Chat.countDocuments({
            participants: req.user._id,
            isActive: true
        });

        const unreadChats = await Chat.countDocuments({
            participants: req.user._id,
            isActive: true,
            unreadMessages: { $gt: 0 }
        });

        const totalMessages = await Chat.aggregate([
            { $match: { participants: req.user._id, isActive: true } },
            { $project: { messageCount: { $size: "$messages" } } },
            { $group: { _id: null, total: { $sum: "$messageCount" } } }
        ]);

        res.json({
            totalChats,
            unreadChats,
            totalMessages: totalMessages.length > 0 ? totalMessages[0].total : 0
        });
    } catch (error) {
        console.error('Get chat stats error:', error);
        res.status(500).json({ message: 'Failed to get chat stats' });
    }
});

// Request contact information (premium feature)
router.post('/:chatId/request-contact', premiumAuth, async (req, res) => {
    try {
        const chat = await Chat.findOne({
            _id: req.params.chatId,
            participants: req.user._id,
            isActive: true
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        const otherUserId = chat.participants.find(
            p => p.toString() !== req.user._id.toString()
        );

        // Create a contact request message
        const message = {
            sender: req.user._id,
            content: 'I would like to share contact information',
            messageType: 'contact_request',
            timestamp: new Date(),
            readBy: [req.user._id],
            metadata: {
                contactRequestStatus: 'pending'
            }
        };

        chat.messages.push(message);
        chat.lastMessage = {
            sender: req.user._id,
            content: 'Contact request',
            timestamp: new Date(),
            messageType: 'contact_request'
        };

        chat.unreadMessages = (chat.unreadMessages || 0) + 1;
        await chat.save();

        await logActivity({
            user: req.user._id,
            type: 'contact_requested',
            target: chat._id,
            targetModel: 'Chat',
            targetUser: otherUserId,
            description: 'Contact information requested'
        });

        res.json({
            message: 'Contact request sent',
            chatMessage: message
        });
    } catch (error) {
        console.error('Contact request error:', error);
        res.status(500).json({ message: 'Failed to send contact request' });
    }
});

// Respond to contact request
router.post('/:chatId/contact-response/:messageId', auth, [
    body('accept').isBoolean()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { accept } = req.body;
        const chat = await Chat.findOne({
            _id: req.params.chatId,
            participants: req.user._id,
            isActive: true
        }); if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Process the contact request
        await processContactRequest(chat, req.params.messageId, req.user, accept);
        await chat.save();
        await updateChatActivity(req.user._id, chat._id, 'responded_to_contact_request', {
            accepted: accept
        });

        const otherUserId = chat.participants.find(
            p => p.toString() !== req.user._id.toString()
        );

        await logActivity({
            user: req.user._id,
            type: accept ? 'contact_shared' : 'contact_declined',
            target: chat._id,
            targetModel: 'Chat',
            targetUser: otherUserId,
            description: accept ? 'Contact information shared' : 'Contact request declined'
        });

        res.json({
            message: accept ? 'Contact information shared' : 'Contact request declined',
            chat,
            status: accept ? 'accepted' : 'rejected'
        });
    } catch (error) {
        console.error('Contact response error:', error);
        res.status(500).json({ message: 'Failed to process contact request response' });
    }
});

module.exports = router;