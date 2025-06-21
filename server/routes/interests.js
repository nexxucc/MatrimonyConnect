const express = require('express');
const { body, validationResult } = require('express-validator');
const Interest = require('../models/Interest');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendInterestNotification } = require('../utils/email');
const { logActivity } = require('../utils/activity');

const router = express.Router();

// Send Interest
router.post('/', auth, [
    body('toUserId').isMongoId(),
    body('message').optional().isLength({ max: 500 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { toUserId, message } = req.body;

        // Check if target user exists and has a profile
        const targetProfile = await Profile.findOne({
            userId: toUserId,
            isProfileApproved: true
        });

        if (!targetProfile) {
            return res.status(404).json({ message: 'Profile not found or not approved' });
        }

        // Check if interest already exists
        const existingInterest = await Interest.findOne({
            $or: [
                { fromUser: req.user._id, toUser: toUserId },
                { fromUser: toUserId, toUser: req.user._id }
            ]
        });

        if (existingInterest) {
            return res.status(400).json({
                message: 'Interest already exists between these users',
                status: existingInterest.status
            });
        }

        // Create new interest
        const interest = new Interest({
            fromUser: req.user._id,
            toUser: toUserId,
            message: message || ''
        });

        await interest.save();

        // Send notification email
        try {
            const fromProfile = await Profile.findOne({ userId: req.user._id });
            const toUser = await User.findById(toUserId);

            if (fromProfile && toUser) {
                const senderName = `${fromProfile.basicInfo.firstName} ${fromProfile.basicInfo.lastName}`;
                await sendInterestNotification(toUser.email, senderName, message);
            }
        } catch (emailError) {
            console.error('Failed to send interest notification email:', emailError);
        }

        // Log activity
        await logActivity({ user: req.user._id, type: 'interest_sent', target: interest._id, targetModel: 'Interest', description: 'Interest sent' });

        res.status(201).json({
            message: 'Interest sent successfully',
            interest
        });

    } catch (error) {
        console.error('Send interest error:', error);
        res.status(500).json({ message: 'Failed to send interest' });
    }
});

// Get Received Interests
router.get('/received', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;

        const query = { toUser: req.user._id };
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        const interests = await Interest.find(query)
            .populate({
                path: 'fromUser',
                select: 'email phone role subscription'
            })
            .populate({
                path: 'fromUser',
                select: 'basicInfo firstName lastName photos location religiousInfo education career',
                model: 'Profile'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Interest.countDocuments(query);

        res.json({
            interests,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalResults: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get received interests error:', error);
        res.status(500).json({ message: 'Failed to get received interests' });
    }
});

// Get Sent Interests
router.get('/sent', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;

        const query = { fromUser: req.user._id };
        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        const interests = await Interest.find(query)
            .populate({
                path: 'toUser',
                select: 'email phone role subscription'
            })
            .populate({
                path: 'toUser',
                select: 'basicInfo firstName lastName photos location religiousInfo education career',
                model: 'Profile'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Interest.countDocuments(query);

        res.json({
            interests,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalResults: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get sent interests error:', error);
        res.status(500).json({ message: 'Failed to get sent interests' });
    }
});

// Respond to Interest
router.put('/:interestId/respond', auth, [
    body('status').isIn(['accepted', 'rejected']),
    body('message').optional().isLength({ max: 500 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { status, message } = req.body;
        const interest = await Interest.findById(req.params.interestId);

        if (!interest) {
            return res.status(404).json({ message: 'Interest not found' });
        }

        // Check if user is the recipient
        if (interest.toUser.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to respond to this interest' });
        }

        // Check if interest is still pending
        if (interest.status !== 'pending') {
            return res.status(400).json({ message: 'Interest has already been responded to' });
        }

        // Update interest
        interest.status = status;
        interest.respondedAt = new Date();
        interest.isRead = true;

        if (message) {
            interest.message = message;
        }

        await interest.save();

        // Log activity
        await logActivity({ user: req.user._id, type: 'interest_responded', target: interest._id, targetModel: 'Interest', description: `Interest ${status}`, details: { status, message } });

        res.json({
            message: `Interest ${status} successfully`,
            interest
        });

    } catch (error) {
        console.error('Respond to interest error:', error);
        res.status(500).json({ message: 'Failed to respond to interest' });
    }
});

// Withdraw Interest
router.put('/:interestId/withdraw', auth, async (req, res) => {
    try {
        const interest = await Interest.findById(req.params.interestId);

        if (!interest) {
            return res.status(404).json({ message: 'Interest not found' });
        }

        // Check if user is the sender
        if (interest.fromUser.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to withdraw this interest' });
        }

        // Check if interest is still pending
        if (interest.status !== 'pending') {
            return res.status(400).json({ message: 'Cannot withdraw interest that has been responded to' });
        }

        interest.status = 'withdrawn';
        await interest.save();

        // Log activity
        await logActivity({ user: req.user._id, type: 'interest_withdrawn', target: interest._id, targetModel: 'Interest', description: 'Interest withdrawn' });

        res.json({
            message: 'Interest withdrawn successfully',
            interest
        });

    } catch (error) {
        console.error('Withdraw interest error:', error);
        res.status(500).json({ message: 'Failed to withdraw interest' });
    }
});

// Mark Interest as Read
router.put('/:interestId/read', auth, async (req, res) => {
    try {
        const interest = await Interest.findById(req.params.interestId);

        if (!interest) {
            return res.status(404).json({ message: 'Interest not found' });
        }

        // Check if user is the recipient
        if (interest.toUser.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to mark this interest as read' });
        }

        interest.isRead = true;
        await interest.save();

        // Log activity
        await logActivity({ user: req.user._id, type: 'interest_read', target: interest._id, targetModel: 'Interest', description: 'Interest marked as read' });

        res.json({
            message: 'Interest marked as read',
            interest
        });

    } catch (error) {
        console.error('Mark interest as read error:', error);
        res.status(500).json({ message: 'Failed to mark interest as read' });
    }
});

// Get Interest Statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const [receivedStats, sentStats] = await Promise.all([
            Interest.aggregate([
                { $match: { toUser: req.user._id } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Interest.aggregate([
                { $match: { fromUser: req.user._id } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
        ]);

        const unreadCount = await Interest.countDocuments({
            toUser: req.user._id,
            isRead: false
        });

        res.json({
            received: receivedStats,
            sent: sentStats,
            unreadCount
        });

    } catch (error) {
        console.error('Get interest stats error:', error);
        res.status(500).json({ message: 'Failed to get interest statistics' });
    }
});

module.exports = router; 