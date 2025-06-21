const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { logActivity } = require('../utils/activity');
const Activity = require('../models/Activity');

const router = express.Router();

// Update User Profile
router.put('/profile', auth, [
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isMobilePhone()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, phone, preferences } = req.body;
        const user = await User.findById(req.user._id);

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already exists' });
            }
            user.email = email;
        }

        if (phone && phone !== user.phone) {
            const existingUser = await User.findOne({ phone });
            if (existingUser) {
                return res.status(400).json({ message: 'Phone already exists' });
            }
            user.phone = phone;
        }

        if (preferences) {
            user.preferences = { ...user.preferences, ...preferences };
        }

        await user.save();
        await logActivity({ user: req.user._id, type: 'profile_update', description: 'Profile updated' });

        res.json({
            message: 'Profile updated successfully',
            user
        });

    } catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
});

// Change Password
router.put('/password', auth, [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Failed to change password' });
    }
});

// Delete Account
router.delete('/account', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // Deactivate user instead of deleting
        user.isActive = false;
        await user.save();

        res.json({ message: 'Account deactivated successfully' });

    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ message: 'Failed to delete account' });
    }
});

// Get User Statistics
router.get('/stats', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // You can add more statistics here based on user activity
        const stats = {
            profileScore: 0,
            interestsReceived: 0,
            interestsSent: 0,
            matchesFound: 0
        };

        res.json({ stats });

    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ message: 'Failed to get user statistics' });
    }
});

// GET /users/activity-logs
router.get('/activity-logs', auth, async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const logs = await Activity.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
    const total = await Activity.countDocuments({ user: req.user._id });
    res.json({ logs, total });
});

// Saved Searches
router.get('/saved-searches', auth, async (req, res) => {
    res.json(req.user.savedSearches || []);
});
router.post('/saved-searches', auth, async (req, res) => {
    req.user.savedSearches = req.user.savedSearches || [];
    req.user.savedSearches.push(req.body);
    await req.user.save();
    res.json({ message: 'Search saved' });
});
router.delete('/saved-searches/:idx', auth, async (req, res) => {
    req.user.savedSearches.splice(req.params.idx, 1);
    await req.user.save();
    res.json({ message: 'Search removed' });
});

// Favorites
router.get('/favorites', auth, async (req, res) => {
    await req.user.populate('favorites');
    res.json(req.user.favorites || []);
});
router.post('/favorites/:profileId', auth, async (req, res) => {
    if (!req.user.favorites.includes(req.params.profileId)) {
        req.user.favorites.push(req.params.profileId);
        await req.user.save();
    }
    res.json({ message: 'Profile favorited' });
});
router.delete('/favorites/:profileId', auth, async (req, res) => {
    req.user.favorites = req.user.favorites.filter(
        (id) => id.toString() !== req.params.profileId
    );
    await req.user.save();
    res.json({ message: 'Profile unfavorited' });
});

module.exports = router; 