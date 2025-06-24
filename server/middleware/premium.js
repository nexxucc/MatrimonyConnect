const User = require('../models/User');

/**
 * Middleware to check if user has active premium subscription
 */
exports.premiumCheck = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPremium = user.subscription &&
            (user.subscription.plan === 'premium' ||
                user.subscription.plan === 'gold' ||
                user.subscription.plan === 'platinum') &&
            user.subscription.isActive &&
            new Date(user.subscription.endDate) > new Date();

        if (!isPremium) {
            return res.status(403).json({
                message: 'This feature requires a premium subscription',
                upgradeInfo: {
                    currentPlan: user.subscription.plan,
                    upgradeOptions: ['premium', 'gold', 'platinum']
                }
            });
        }

        next();
    } catch (error) {
        console.error('Premium check error:', error);
        res.status(500).json({ message: 'Server error during premium access check' });
    }
};
