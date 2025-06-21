const express = require('express');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Interest = require('../models/Interest');
const Payment = require('../models/Payment');
const Activity = require('../models/Activity');
const { adminAuth } = require('../middleware/auth');
const { sendProfileApprovalEmail } = require('../utils/email');

const router = express.Router();

// Get Dashboard Stats
router.get('/dashboard', adminAuth, async (req, res) => {
    try {
        const [
            totalUsers,
            totalProfiles,
            pendingApprovals,
            totalInterests,
            totalPayments,
            recentUsers
        ] = await Promise.all([
            User.countDocuments(),
            Profile.countDocuments(),
            Profile.countDocuments({ isProfileApproved: false }),
            Interest.countDocuments(),
            Payment.countDocuments(),
            User.find().sort({ createdAt: -1 }).limit(10)
        ]);

        // Get monthly stats
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);

        const monthlyStats = await Promise.all([
            User.countDocuments({ createdAt: { $gte: currentMonth } }),
            Profile.countDocuments({ createdAt: { $gte: currentMonth } }),
            Interest.countDocuments({ createdAt: { $gte: currentMonth } }),
            Payment.countDocuments({ createdAt: { $gte: currentMonth } })
        ]);

        res.json({
            stats: {
                totalUsers,
                totalProfiles,
                pendingApprovals,
                totalInterests,
                totalPayments
            },
            monthlyStats: {
                newUsers: monthlyStats[0],
                newProfiles: monthlyStats[1],
                newInterests: monthlyStats[2],
                newPayments: monthlyStats[3]
            },
            recentUsers
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Failed to get dashboard stats' });
    }
});

// Get Users List
router.get('/users', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20, search, role, status } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        if (search) {
            query.$or = [
                { email: new RegExp(search, 'i') },
                { phone: new RegExp(search, 'i') }
            ];
        }
        if (role) query.role = role;
        if (status === 'active') query.isActive = true;
        if (status === 'inactive') query.isActive = false;

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalResults: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Failed to get users' });
    }
});

// Get Profiles for Approval
router.get('/profiles/pending', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const profiles = await Profile.find({ isProfileApproved: false })
            .populate('userId', 'email phone role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Profile.countDocuments({ isProfileApproved: false });

        res.json({
            profiles,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalResults: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get pending profiles error:', error);
        res.status(500).json({ message: 'Failed to get pending profiles' });
    }
});

// Approve/Reject Profile
router.put('/profiles/:profileId/approve', adminAuth, async (req, res) => {
    try {
        const { isApproved, reason } = req.body;
        const profile = await Profile.findById(req.params.profileId)
            .populate('userId', 'email');

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        profile.isProfileApproved = isApproved;
        await profile.save();

        // Send email notification
        if (profile.userId.email) {
            try {
                await sendProfileApprovalEmail(profile.userId.email, isApproved, reason);
            } catch (emailError) {
                console.error('Failed to send approval email:', emailError);
            }
        }

        res.json({
            message: `Profile ${isApproved ? 'approved' : 'rejected'} successfully`,
            profile
        });

    } catch (error) {
        console.error('Approve profile error:', error);
        res.status(500).json({ message: 'Failed to approve profile' });
    }
});

// Approve/Reject Photo
router.put('/profiles/:profileId/photos/:photoIndex/approve', adminAuth, async (req, res) => {
    try {
        const { isApproved } = req.body;
        const profile = await Profile.findById(req.params.profileId);

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const photoIndex = parseInt(req.params.photoIndex);
        if (photoIndex < 0 || photoIndex >= profile.photos.length) {
            return res.status(400).json({ message: 'Invalid photo index' });
        }

        profile.photos[photoIndex].isApproved = isApproved;
        await profile.save();

        res.json({
            message: `Photo ${isApproved ? 'approved' : 'rejected'} successfully`,
            photos: profile.photos
        });

    } catch (error) {
        console.error('Approve photo error:', error);
        res.status(500).json({ message: 'Failed to approve photo' });
    }
});

// Update User Role
router.put('/users/:userId/role', adminAuth, async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.json({
            message: 'User role updated successfully',
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ message: 'Failed to update user role' });
    }
});

// Deactivate/Activate User
router.put('/users/:userId/status', adminAuth, async (req, res) => {
    try {
        const { isActive } = req.body;
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = isActive;
        await user.save();

        res.json({
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user: {
                id: user._id,
                email: user.email,
                isActive: user.isActive
            }
        });

    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ message: 'Failed to update user status' });
    }
});

// Get Payment Analytics
router.get('/payments/analytics', adminAuth, async (req, res) => {
    try {
        const { period = 'month' } = req.query;

        let startDate;
        const now = new Date();

        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const payments = await Payment.find({
            createdAt: { $gte: startDate },
            paymentStatus: 'completed'
        });

        const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const planStats = payments.reduce((stats, payment) => {
            stats[payment.plan] = (stats[payment.plan] || 0) + 1;
            return stats;
        }, {});

        res.json({
            totalRevenue,
            totalPayments: payments.length,
            planStats,
            period
        });

    } catch (error) {
        console.error('Get payment analytics error:', error);
        res.status(500).json({ message: 'Failed to get payment analytics' });
    }
});

// Get Interest Analytics
router.get('/interests/analytics', adminAuth, async (req, res) => {
    try {
        const { period = 'month' } = req.query;

        let startDate;
        const now = new Date();

        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const interests = await Interest.find({
            createdAt: { $gte: startDate }
        });

        const statusStats = interests.reduce((stats, interest) => {
            stats[interest.status] = (stats[interest.status] || 0) + 1;
            return stats;
        }, {});

        res.json({
            totalInterests: interests.length,
            statusStats,
            period
        });

    } catch (error) {
        console.error('Get interest analytics error:', error);
        res.status(500).json({ message: 'Failed to get interest analytics' });
    }
});

// GET /admin/activity-logs
router.get('/activity-logs', adminAuth, async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const logs = await Activity.find()
        .populate('user', 'email role')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
    const total = await Activity.countDocuments();
    res.json({ logs, total });
});

// Verify profile
router.post('/profiles/:profileId/verify', adminAuth, async (req, res) => {
    const profile = await Profile.findById(req.params.profileId);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    profile.isVerified = true;
    await profile.save();
    res.json({ message: 'Profile verified' });
});

// Unverify profile
router.post('/profiles/:profileId/unverify', adminAuth, async (req, res) => {
    const profile = await Profile.findById(req.params.profileId);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    profile.isVerified = false;
    await profile.save();
    res.json({ message: 'Profile unverified' });
});

// List all payments
router.get('/payments', adminAuth, async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const payments = await Payment.find()
        .populate('user', 'email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
    const total = await Payment.countDocuments();
    res.json({ payments, total });
});

// Refund a payment (dummy, extend for Stripe)
router.post('/payments/:paymentId/refund', adminAuth, async (req, res) => {
    // TODO: Integrate with Stripe for real refunds
    res.json({ message: 'Refund processed (mock)' });
});

// List all reports
router.get('/reports', adminAuth, async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const profiles = await Profile.find({ 'reports.0': { $exists: true } })
        .populate('reports.reporter', 'email')
        .skip((page - 1) * limit)
        .limit(Number(limit));
    const total = await Profile.countDocuments({ 'reports.0': { $exists: true } });
    res.json({ profiles, total });
});

// Resolve a report (remove from profile)
router.post('/reports/:profileId/:reportIdx/resolve', adminAuth, async (req, res) => {
    const profile = await Profile.findById(req.params.profileId);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    profile.reports.splice(req.params.reportIdx, 1);
    await profile.save();
    res.json({ message: 'Report resolved' });
});

module.exports = router; 