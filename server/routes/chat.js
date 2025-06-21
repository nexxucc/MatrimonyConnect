const express = require('express');
const { body, validationResult } = require('express-validator');
const Chat = require('../models/Chat');
const Interest = require('../models/Interest');
const { auth, premiumAuth } = require('../middleware/auth');
const { logActivity } = require('../utils/activity');

const router = express.Router();

// Get Chat List
router.get('/', auth, async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user._id,
            isActive: true
        })
            .populate('participants', 'email phone')
            .populate('lastMessage.sender', 'basicInfo firstName lastName')
            .sort({ 'lastMessage.timestamp': -1 });

        res.json({ chats });
    } catch (error) {
        console.error('Get chat list error:', error);
        res.status(500).json({ message: 'Failed to get chat list' });
    }
});

// Get Chat Messages
router.get('/:chatId', premiumAuth, async (req, res) => {
    try {
        const chat = await Chat.findOne({
            _id: req.params.chatId,
            participants: req.user._id
        }).populate('participants', 'email phone basicInfo firstName lastName');

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        res.json({ chat });
    } catch (error) {
        console.error('Get chat messages error:', error);
        res.status(500).json({ message: 'Failed to get chat messages' });
    }
});

// Send Message
router.post('/:chatId/messages', premiumAuth, [
    body('content').notEmpty().isLength({ max: 1000 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { content } = req.body;
        const chat = await Chat.findOne({
            _id: req.params.chatId,
            participants: req.user._id
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Add message to chat
        const message = {
            sender: req.user._id,
            content,
            messageType: 'text'
        };

        chat.messages.push(message);
        await chat.save();

        await logActivity({ user: req.user._id, type: 'chat_message', target: req.params.chatId, targetModel: 'Chat', description: 'Message sent' });

        res.json({
            message: 'Message sent successfully',
            message: message
        });

    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

module.exports = router; 