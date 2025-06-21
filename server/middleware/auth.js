const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
            }
            next();
        });
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed.' });
    }
};

const premiumAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            if (req.user.subscription.plan === 'free' && !req.user.subscription.isActive) {
                return res.status(403).json({ message: 'Premium subscription required for this feature.' });
            }
            next();
        });
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed.' });
    }
};

module.exports = { auth, adminAuth, premiumAuth }; 