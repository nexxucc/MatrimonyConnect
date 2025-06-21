const Activity = require('../models/Activity');

async function logActivity({ user, type, target, targetModel, description, meta }) {
    try {
        await Activity.create({ user, type, target, targetModel, description, meta });
    } catch (err) {
        // Optionally log error
        console.error('Activity log error:', err);
    }
}

module.exports = { logActivity }; 