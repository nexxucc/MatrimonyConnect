const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { body, validationResult } = require('express-validator');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { auth, premiumAuth } = require('../middleware/auth');
const { sendProfileApprovalEmail } = require('../utils/email');
const { logActivity } = require('../utils/activity');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Create/Update Profile
router.post('/', auth, [
    body('basicInfo.firstName').notEmpty().trim(),
    body('basicInfo.lastName').notEmpty().trim(),
    body('basicInfo.dateOfBirth').isISO8601(),
    body('basicInfo.gender').isIn(['male', 'female']),
    body('basicInfo.maritalStatus').isIn(['never_married', 'divorced', 'widowed', 'awaiting_divorce']),
    body('location.country').notEmpty(),
    body('location.state').notEmpty(),
    body('location.city').notEmpty(),
    body('religiousInfo.religion').notEmpty(),
    body('education.highestQualification').notEmpty(),
    body('career.profession').notEmpty(),
    body('career.income').isIn(['below_5_lakhs', '5_10_lakhs', '10_15_lakhs', '15_25_lakhs', '25_50_lakhs', 'above_50_lakhs'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let profile = await Profile.findOne({ userId: req.user._id });

        if (profile) {
            // Update existing profile
            Object.assign(profile, req.body);
            profile.isProfileComplete = true;
            profile.isProfileApproved = false; // Reset approval when updated
        } else {
            // Create new profile
            profile = new Profile({
                userId: req.user._id,
                ...req.body,
                isProfileComplete: true
            });
        }

        // Calculate profile score
        profile.profileScore = calculateProfileScore(profile);

        await profile.save();

        await logActivity({ user: req.user._id, type: 'profile_update', target: profile._id, targetModel: 'Profile', description: 'Profile updated' });

        res.json({
            message: 'Profile saved successfully',
            profile
        });

    } catch (error) {
        console.error('Profile save error:', error);
        res.status(500).json({ message: 'Failed to save profile' });
    }
});

// Get Profile
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user._id })
            .populate('userId', 'email phone role subscription');

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({ profile });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Failed to get profile' });
    }
});

// Get Profile by ID (for viewing other profiles)
router.get('/:profileId', auth, async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.profileId)
            .populate('userId', 'email phone role subscription');

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Check if profile is approved and visible
        if (!profile.isProfileApproved) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Apply privacy settings
        const publicProfile = applyPrivacySettings(profile, req.user._id);

        res.json({ profile: publicProfile });
    } catch (error) {
        console.error('Get profile by ID error:', error);
        res.status(500).json({ message: 'Failed to get profile' });
    }
});

// Upload Photo
router.post('/photos', auth, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No photo uploaded' });
        }

        const profile = await Profile.findOne({ userId: req.user._id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload_stream(
            {
                folder: 'matrimony-profiles',
                transformation: [
                    { width: 800, height: 800, crop: 'fill' },
                    { quality: 'auto' }
                ]
            },
            async (error, result) => {
                if (error) {
                    return res.status(500).json({ message: 'Failed to upload photo' });
                }

                // Add photo to profile
                const photo = {
                    url: result.secure_url,
                    isPrimary: profile.photos.length === 0, // First photo is primary
                    isApproved: false,
                    uploadedAt: new Date()
                };

                profile.photos.push(photo);
                await profile.save();

                res.json({
                    message: 'Photo uploaded successfully',
                    photo
                });
            }
        ).end(req.file.buffer);

    } catch (error) {
        console.error('Photo upload error:', error);
        res.status(500).json({ message: 'Failed to upload photo' });
    }
});

// Set Primary Photo
router.put('/photos/:photoIndex/primary', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user._id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const photoIndex = parseInt(req.params.photoIndex);
        if (photoIndex < 0 || photoIndex >= profile.photos.length) {
            return res.status(400).json({ message: 'Invalid photo index' });
        }

        // Reset all photos to not primary
        profile.photos.forEach(photo => photo.isPrimary = false);

        // Set selected photo as primary
        profile.photos[photoIndex].isPrimary = true;

        await profile.save();

        res.json({
            message: 'Primary photo updated successfully',
            photos: profile.photos
        });

    } catch (error) {
        console.error('Set primary photo error:', error);
        res.status(500).json({ message: 'Failed to update primary photo' });
    }
});

// Delete Photo
router.delete('/photos/:photoIndex', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user._id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const photoIndex = parseInt(req.params.photoIndex);
        if (photoIndex < 0 || photoIndex >= profile.photos.length) {
            return res.status(400).json({ message: 'Invalid photo index' });
        }

        const deletedPhoto = profile.photos[photoIndex];

        // Remove photo from array
        profile.photos.splice(photoIndex, 1);

        // If deleted photo was primary and there are other photos, set first as primary
        if (deletedPhoto.isPrimary && profile.photos.length > 0) {
            profile.photos[0].isPrimary = true;
        }

        await profile.save();

        // Delete from Cloudinary
        if (deletedPhoto.url) {
            const publicId = deletedPhoto.url.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`matrimony-profiles/${publicId}`);
        }

        res.json({
            message: 'Photo deleted successfully',
            photos: profile.photos
        });

    } catch (error) {
        console.error('Delete photo error:', error);
        res.status(500).json({ message: 'Failed to delete photo' });
    }
});

// Update Preferences
router.put('/preferences', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user._id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        profile.preferences = { ...profile.preferences, ...req.body };
        await profile.save();

        res.json({
            message: 'Preferences updated successfully',
            preferences: profile.preferences
        });

    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({ message: 'Failed to update preferences' });
    }
});

// Update Privacy Settings
router.put('/privacy', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user._id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        profile.privacySettings = { ...profile.privacySettings, ...req.body };
        await profile.save();

        res.json({
            message: 'Privacy settings updated successfully',
            privacySettings: profile.privacySettings
        });

    } catch (error) {
        console.error('Update privacy settings error:', error);
        res.status(500).json({ message: 'Failed to update privacy settings' });
    }
});

// Hide/unhide profile
router.post('/me/hide', auth, async (req, res) => {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    profile.privacySettings.isHidden = true;
    await profile.save();
    res.json({ message: 'Profile hidden' });
});

router.post('/me/unhide', auth, async (req, res) => {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    profile.privacySettings.isHidden = false;
    await profile.save();
    res.json({ message: 'Profile visible' });
});

// Update whoCanContact
router.post('/me/contact-setting', auth, async (req, res) => {
    const { whoCanContact } = req.body;
    if (!['all', 'matches', 'none'].includes(whoCanContact)) return res.status(400).json({ message: 'Invalid value' });
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    profile.privacySettings.whoCanContact = whoCanContact;
    await profile.save();
    res.json({ message: 'Contact setting updated' });
});

// Block/unblock user
router.post('/block/:userId', auth, async (req, res) => {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    if (!profile.blockedUsers.includes(req.params.userId)) {
        profile.blockedUsers.push(req.params.userId);
        await profile.save();
    }
    res.json({ message: 'User blocked' });
});

router.post('/unblock/:userId', auth, async (req, res) => {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    profile.blockedUsers = profile.blockedUsers.filter(
        (id) => id.toString() !== req.params.userId
    );
    await profile.save();
    res.json({ message: 'User unblocked' });
});

// Report user
router.post('/report/:profileId', auth, async (req, res) => {
    const { reason, details } = req.body;
    const profile = await Profile.findById(req.params.profileId);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    profile.reports.push({ reporter: req.user._id, reason, details });
    await profile.save();
    res.json({ message: 'User reported' });
});

// Boost profile (premium only)
router.post('/boost', premiumAuth, async (req, res) => {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    const now = new Date();
    profile.boostedUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await profile.save();
    res.json({ message: 'Profile boosted for 7 days' });
});

// Helper function to calculate profile score
const calculateProfileScore = (profile) => {
    let score = 0;

    // Basic info (30 points)
    if (profile.basicInfo.firstName) score += 5;
    if (profile.basicInfo.lastName) score += 5;
    if (profile.basicInfo.dateOfBirth) score += 5;
    if (profile.basicInfo.gender) score += 5;
    if (profile.basicInfo.maritalStatus) score += 5;
    if (profile.basicInfo.height) score += 5;

    // Location (15 points)
    if (profile.location.country) score += 5;
    if (profile.location.state) score += 5;
    if (profile.location.city) score += 5;

    // Religious info (15 points)
    if (profile.religiousInfo.religion) score += 10;
    if (profile.religiousInfo.caste) score += 5;

    // Education & Career (20 points)
    if (profile.education.highestQualification) score += 10;
    if (profile.career.profession) score += 5;
    if (profile.career.income) score += 5;

    // Photos (20 points)
    score += Math.min(profile.photos.length * 5, 20);

    return Math.min(score, 100);
};

// Helper function to apply privacy settings
const applyPrivacySettings = (profile, viewerId) => {
    const publicProfile = { ...profile.toObject() };

    // If viewing own profile, show everything
    if (profile.userId._id.toString() === viewerId.toString()) {
        return publicProfile;
    }

    // Apply privacy settings
    if (!profile.privacySettings.showPhotos) {
        publicProfile.photos = [];
    }

    if (!profile.privacySettings.showContact) {
        publicProfile.userId.phone = undefined;
    }

    if (!profile.privacySettings.showIncome) {
        publicProfile.career.income = undefined;
    }

    if (!profile.privacySettings.showLocation) {
        publicProfile.location.address = undefined;
    }

    return publicProfile;
};

module.exports = router; 