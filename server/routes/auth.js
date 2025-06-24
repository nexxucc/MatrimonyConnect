const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { auth } = require('../middleware/auth');
const { sendOTP, verifyOTP, sendUserOTP, sendWhatsAppOTP } = require('../utils/otp');
const { sendEmail } = require('../utils/email');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Utility: Normalize Gmail address (removes dots from username part)
function normalizeGmail(email) {
    email = email.trim().toLowerCase();
    const gmailRegex = /^([a-z0-9.]+)@gmail\.com$/;
    const match = email.match(gmailRegex);
    if (match) {
        return match[1].replace(/\./g, '') + '@gmail.com';
    }
    return email;
}

// Utility: Ensure valid date or fallback
function getValidDateOrDefault(dateStr, fallback = '1990-01-01') {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date(fallback) : d;
}

// Register User
router.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('phone').isMobilePhone(),
    body('password').isLength({ min: 6 }),
    body('gender').isIn(['male', 'female']),
    body('name').exists()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, phone, password, gender, name } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { phone }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'User with this email or phone already exists'
            });
        }

        // Create new user
        const user = new User({
            email,
            phone,
            password,
            gender,
            name,
            role: 'user'
        });

        // Save normalized email for lookup
        user.emailNormalized = normalizeGmail(email);

        await user.save();

        // --- AUTO-CREATE PROFILE FOR USER ---
        // Use minimal/default values for required fields
        let profile;
        try {
            profile = new Profile({
                userId: user._id,
                basicInfo: {
                    firstName: name.split(' ')[0] || name,
                    lastName: name.split(' ')[1] || name,
                    dateOfBirth: getValidDateOrDefault(undefined), // Always valid
                    gender: gender,
                    maritalStatus: 'never_married', // Default, user should update
                    children: 'no',
                    height: 170, // Default height in cm
                    weight: 70   // Default weight in kg
                },
                location: {
                    country: 'India', // Default, user should update
                    state: 'Unknown', // Default, user should update
                    city: 'Unknown' // Default, user should update
                },
                religiousInfo: {
                    religion: 'Hindu' // Default, user should update
                },
                education: {
                    highestQualification: 'Bachelors' // Default, user should update
                },
                career: {
                    profession: 'Other', // Default, user should update
                    income: 'below_5_lakhs' // Default, user should update
                }
            });
            await profile.save();
        } catch (profileError) {
            console.error('Profile creation error:', profileError);
            // Rollback user creation if profile fails
            await User.findByIdAndDelete(user._id);
            return res.status(500).json({ message: 'Failed to create user profile. Please try again.' });
        }
        // --- END AUTO-CREATE PROFILE ---

        // Generate and store OTP, but do NOT send it yet
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.phoneOtp = otp;
        user.emailOtp = otp;
        user.phoneOtpExpiresAt = undefined;
        user.emailOtpExpiresAt = undefined;
        await user.save();
        // Do NOT send OTP here

        const token = generateToken(user._id);

        res.status(201).json({
            message: 'User registered successfully. Please verify your phone number.',
            token,
            user: {
                id: user._id,
                email: user.email,
                phone: user.phone,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
});

// Verify OTP
router.post('/verify-otp', [
    body('phone').custom(value => {
        if (value === undefined || value === null) return true; // allow missing phone for email verification
        const trimmed = value.trim();
        console.log('Phone received for OTP verification:', trimmed);
        if (!/^[+\d]{10,15}$/.test(trimmed)) {
            throw new Error('Invalid phone format');
        }
        return true;
    }),
    body('otp').isLength({ min: 4, max: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let { phone, email, otp } = req.body;
        if (email) email = normalizeGmail(email);
        if (phone) phone = phone.trim();
        console.log('Verify OTP request:', { phone, email, otp });
        let user;
        if (phone) {
            user = await User.findOne({ phone });
        } else if (email) {
            user = await User.findOne({ email });
        } else {
            return res.status(400).json({ message: 'Phone or email is required' });
        }
        if (!user) {
            console.log('User not found for:', { phone, email });
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }
        // Unified OTP check: accept either phoneOtp or emailOtp
        if (user.phoneOtp === otp || user.emailOtp === otp) {
            user.isVerified = true;
            user.phoneOtp = undefined;
            user.emailOtp = undefined;
        } else {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        await user.save();
        // Generate a new token after verification so the frontend can use it for authenticated requests
        const token = generateToken(user._id);
        res.json({
            message: 'Account verified successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                phone: user.phone,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'OTP verification failed' });
    }
});

// Login User
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(401).json({ message: 'Account is deactivated' });
        }        // Update last login
        await User.findByIdAndUpdate(user._id, {
            lastLogin: new Date(),
            $push: { loginHistory: { time: new Date(), ip: req.ip } }
        });

        const token = generateToken(user._id);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified,
                subscription: user.subscription
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});

// Forgot Password
router.post('/forgot-password', [
    body('email').isEmail().normalizeEmail()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Store reset token (in production, use Redis with expiration)
        user.resetToken = resetToken;
        user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        // Send reset email
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        await sendEmail(
            user.email,
            'Password Reset Request',
            `Click the following link to reset your password: ${resetUrl}`
        );

        res.json({ message: 'Password reset email sent' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Failed to send reset email' });
    }
});

// Reset Password
router.post('/reset-password', [
    body('token').exists(),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { token, password } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || user.resetToken !== token || user.resetTokenExpiry < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        user.password = password;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Password reset failed' });
    }
});

// Get Current User
router.get('/me', auth, async (req, res) => {
    try {
        res.json({
            user: req.user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Failed to get user data' });
    }
});

// Logout (client-side token removal)
router.post('/logout', auth, async (req, res) => {
    try {
        // In production, you might want to blacklist the token
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Logout failed' });
    }
});

// Send OTP (for phone or email)
router.post('/send-otp', async (req, res) => {
    try {
        let { phone, email } = req.body;
        if (email) email = normalizeGmail(email);
        if (phone) phone = phone.trim();
        let user;
        if (phone) {
            user = await User.findOne({ phone });
        } else if (email) {
            const normalized = normalizeGmail(email);
            user = await User.findOne({ emailNormalized: normalized });
        } else {
            return res.status(400).json({ message: 'Phone or email is required' });
        }
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (phone) {
            await sendUserOTP(user, 'phone', sendWhatsAppOTP);
        } else if (email) {
            await sendUserOTP(user, 'email', sendEmail.bind(null, email, 'Your Matrimony Connect OTP'));
        }
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
});

module.exports = router;