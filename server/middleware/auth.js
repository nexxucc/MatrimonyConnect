const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        if (!user.isActive) {
            return res.status(401).json({ message: 'Account is deactivated.' });
        }        // Update last active timestamp in user
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        // Update last active timestamp in profile
        await Profile.findOneAndUpdate(
            { userId: user._id },
            { lastActive: new Date() },
            { new: true }
        );

        // Track user activity with IP address and device info
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];        // Add login history (limit to 10 entries) using direct DB update to avoid versioning conflicts
        await User.findByIdAndUpdate(user._id, {
            $push: {
                loginHistory: {
                    $each: [{
                        timestamp: new Date(),
                        ipAddress,
                        deviceInfo: userAgent,
                        location: 'Unknown' // In a real app, this would use IP geolocation
                    }],
                    $slice: -10 // Keep only the last 10 entries
                }
            }
        });

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ message: 'Invalid token or authentication failure.' });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    message: 'Access denied. Admin privileges required.',
                    status: 'unauthorized'
                });
            }
            next();
        });
    } catch (error) {
        console.error('Admin authentication error:', error.message);
        res.status(401).json({ message: 'Admin authentication failed: ' + error.message });
    }
};

const moderatorAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
                return res.status(403).json({
                    message: 'Access denied. Moderator or Admin privileges required.',
                    status: 'unauthorized'
                });
            }
            next();
        });
    } catch (error) {
        console.error('Moderator authentication error:', error.message);
        res.status(401).json({ message: 'Moderator authentication failed: ' + error.message });
    }
};

const premiumAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            const isPremium = req.user.subscription &&
                (req.user.subscription.plan === 'premium' ||
                    req.user.subscription.plan === 'gold' ||
                    req.user.subscription.plan === 'platinum') &&
                req.user.subscription.isActive &&
                new Date(req.user.subscription.endDate) > new Date();

            if (!isPremium) {
                return res.status(403).json({
                    message: 'Premium subscription required for this feature.',
                    status: 'subscription_required',
                    currentPlan: req.user.subscription?.plan || 'free',
                    subscriptionOptions: [
                        { plan: 'premium', features: ['Chat with anyone', 'View contact details', 'Advanced search'] },
                        { plan: 'gold', features: ['All Premium features', 'Profile highlighting', 'Priority in search results'] },
                        { plan: 'platinum', features: ['All Gold features', 'Video calling', 'Relationship advisor'] }
                    ]
                });
            }
            next();
        });
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed.' });
    }
};

// Account verification middleware - for features requiring verified accounts
const verifiedAuth = async (req, res, next) => {
    try {
        await auth(req, res, async () => {
            const profile = await Profile.findOne({ userId: req.user._id });

            if (!profile || !profile.isVerified) {
                return res.status(403).json({
                    message: 'This feature requires account verification.',
                    status: 'verification_required',
                    verificationSteps: [
                        'Upload a valid government ID',
                        'Verify your phone number',
                        'Verify your email address'
                    ]
                });
            }
            next();
        });
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed.' });
    }
};

module.exports = { auth, adminAuth, premiumAuth, moderatorAuth, verifiedAuth };