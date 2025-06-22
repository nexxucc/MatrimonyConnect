const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { sendUserOTP, sendWhatsAppOTP } = require('../utils/otp');
const { sendEmail } = require('../utils/email');

const router = express.Router();

// Send OTP for verification (email or phone)
router.post('/', [
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isMobilePhone()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let { email, phone } = req.body;
        if (!email && !phone) {
            return res.status(400).json({ message: 'Email or phone is required' });
        }
        let user;
        if (phone) {
            user = await User.findOne({ phone });
            if (!user) {
                return res.status(404).json({ message: 'User with this phone not found' });
            }
            await sendUserOTP(user, 'phone', sendWhatsAppOTP);
        } else if (email) {
            user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User with this email not found' });
            }
            await sendUserOTP(user, 'email', (to, otp) => sendEmail(to, 'Your Matrimony Connect Verification Code', `Your verification code is: ${otp}. Valid for 10 minutes.`));
        }
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
});

module.exports = router;
