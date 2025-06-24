const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { body, validationResult } = require('express-validator');
const SuccessStory = require('../models/SuccessStory');
const Profile = require('../models/Profile');
const { auth, adminAuth } = require('../middleware/auth');
const { logActivity } = require('../utils/activity');
const { sendSuccessStoryNotification } = require('../utils/email');

const router = express.Router();

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

// Get all approved stories (paginated)
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, featured, sort = 'recent' } = req.query;
        const skip = (page - 1) * limit;

        const query = { status: 'approved', visibilityPreference: 'public' };

        // If user is logged in, include stories visible to registered users
        if (req.user) {
            query.visibilityPreference = { $in: ['public', 'registered_users'] };
        }

        // If featured flag is present, filter by featured rank
        if (featured === 'true') {
            query.featuredRank = { $gt: 0 };
        }

        // Determine sort order
        let sortOption = { createdAt: -1 }; // Default recent
        if (sort === 'popular') {
            sortOption = { views: -1 };
        } else if (sort === 'featured') {
            sortOption = { featuredRank: -1 };
        }

        const stories = await SuccessStory.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('primaryProfile', 'basicInfo.firstName basicInfo.lastName photos')
            .populate('partnerProfile', 'basicInfo.firstName basicInfo.lastName photos');

        const total = await SuccessStory.countDocuments(query);

        res.json({
            stories,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalResults: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get success stories error:', error);
        res.status(500).json({ message: 'Failed to get success stories' });
    }
});

// Get single success story by ID
router.get('/:id', async (req, res) => {
    try {
        const story = await SuccessStory.findById(req.params.id)
            .populate('primaryProfile', 'basicInfo photos')
            .populate('partnerProfile', 'basicInfo photos');

        if (!story) {
            return res.status(404).json({ message: 'Success story not found' });
        }

        // Check visibility permissions
        if (story.status !== 'approved') {
            // Only admins or story owners can see non-approved stories
            if (!req.user ||
                (req.user.role !== 'admin' &&
                    story.primaryProfile.userId.toString() !== req.user._id.toString())) {
                return res.status(403).json({ message: 'You do not have permission to view this story' });
            }
        }

        // Check visibility preference
        if (story.visibilityPreference === 'registered_users' && !req.user) {
            return res.status(403).json({ message: 'You must be logged in to view this story' });
        }

        if (story.visibilityPreference === 'private' &&
            (!req.user ||
                (req.user.role !== 'admin' &&
                    story.primaryProfile.userId.toString() !== req.user._id.toString()))) {
            return res.status(403).json({ message: 'This story is private' });
        }

        // Increment view count if not owner or admin
        if (req.user &&
            req.user.role !== 'admin' &&
            story.primaryProfile.userId.toString() !== req.user._id.toString()) {
            story.views += 1;
            await story.save();
        }

        res.json({ story });
    } catch (error) {
        console.error('Get success story error:', error);
        res.status(500).json({ message: 'Failed to get success story' });
    }
});

// Create success story
router.post('/', auth, [
    body('title').notEmpty().trim().withMessage('Title is required'),
    body('story').notEmpty().withMessage('Story content is required'),
    body('partnerProfileId').optional().isMongoId().withMessage('Valid partner profile ID is required'),
    body('marriageDate').optional().isISO8601().withMessage('Valid date is required for marriage date'),
    body('connectionDate').optional().isISO8601().withMessage('Valid date is required for connection date'),
    body('isPlatformMatch').isBoolean().withMessage('isPlatformMatch must be true or false'),
    body('testimonial').optional().trim(),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('visibilityPreference').isIn(['public', 'registered_users', 'private']).withMessage('Invalid visibility preference')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Get user's profile
        const userProfile = await Profile.findOne({ userId: req.user._id });
        if (!userProfile) {
            return res.status(404).json({ message: 'Your profile not found' });
        }

        // Check if partner profile exists if provided
        let partnerProfile = null;
        if (req.body.partnerProfileId) {
            partnerProfile = await Profile.findById(req.body.partnerProfileId);
            if (!partnerProfile) {
                return res.status(404).json({ message: 'Partner profile not found' });
            }
        }

        // Create success story
        const successStory = new SuccessStory({
            primaryProfile: userProfile._id,
            partnerProfile: partnerProfile ? partnerProfile._id : null,
            title: req.body.title,
            story: req.body.story,
            marriageDate: req.body.marriageDate,
            connectionDate: req.body.connectionDate,
            isPlatformMatch: req.body.isPlatformMatch,
            testimonial: req.body.testimonial,
            rating: req.body.rating,
            visibilityPreference: req.body.visibilityPreference,
            tags: req.body.tags || []
        });

        await successStory.save();

        // Log activity
        await logActivity({
            user: req.user._id,
            type: 'success_story_created',
            target: successStory._id,
            targetModel: 'SuccessStory',
            description: 'Success story created'
        });

        // Notify admin
        try {
            await sendSuccessStoryNotification(
                'admin@matrimonyconnect.com',  // Admin email
                userProfile.basicInfo.firstName,
                successStory.title
            );
        } catch (emailError) {
            console.error('Failed to send success story notification email:', emailError);
        }

        res.status(201).json({
            message: 'Success story created successfully and pending approval',
            successStory
        });
    } catch (error) {
        console.error('Create success story error:', error);
        res.status(500).json({ message: 'Failed to create success story' });
    }
});

// Update success story (own story only)
router.put('/:id', auth, async (req, res) => {
    try {
        const story = await SuccessStory.findById(req.params.id)
            .populate('primaryProfile');

        if (!story) {
            return res.status(404).json({ message: 'Success story not found' });
        }

        // Check ownership
        if (story.primaryProfile.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You do not have permission to update this story' });
        }

        // Fields that can be updated by the user
        const allowedUpdates = [
            'title', 'story', 'marriageDate', 'connectionDate',
            'testimonial', 'rating', 'visibilityPreference', 'tags'
        ];

        // Update allowed fields
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                story[field] = req.body[field];
            }
        });

        // Reset approval status if content changed (unless admin)
        if (req.user.role !== 'admin' &&
            (req.body.title !== undefined || req.body.story !== undefined)) {
            story.status = 'pending';
        }

        await story.save();

        // Log activity
        await logActivity({
            user: req.user._id,
            type: 'success_story_updated',
            target: story._id,
            targetModel: 'SuccessStory',
            description: 'Success story updated'
        });

        res.json({
            message: 'Success story updated successfully',
            successStory: story
        });
    } catch (error) {
        console.error('Update success story error:', error);
        res.status(500).json({ message: 'Failed to update success story' });
    }
});

// Upload photo for success story
router.post('/:id/photos', auth, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No photo uploaded' });
        }

        const story = await SuccessStory.findById(req.params.id)
            .populate('primaryProfile');

        if (!story) {
            return res.status(404).json({ message: 'Success story not found' });
        }

        // Check ownership
        if (story.primaryProfile.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You do not have permission to add photos to this story' });
        }

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'matrimony-success-stories',
                    transformation: [
                        { width: 1200, height: 800, crop: 'fill' },
                        { quality: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            uploadStream.end(req.file.buffer);
        });

        // Add photo to success story
        const photo = {
            url: result.secure_url,
            caption: req.body.caption || '',
            uploadedAt: new Date(),
            isApproved: req.user.role === 'admin' // Auto-approve if admin
        };

        story.photos.push(photo);

        // Set as cover photo if it's the first one or explicitly requested
        if (story.photos.length === 1 || req.body.setCover === 'true') {
            story.coverPhoto = result.secure_url;
        }

        await story.save();

        // Log activity
        await logActivity({
            user: req.user._id,
            type: 'success_story_photo_added',
            target: story._id,
            targetModel: 'SuccessStory',
            description: 'Photo added to success story'
        });

        res.json({
            message: 'Photo uploaded successfully',
            photo
        });
    } catch (error) {
        console.error('Upload success story photo error:', error);
        res.status(500).json({ message: 'Failed to upload photo' });
    }
});

// Like a success story
router.post('/:id/like', auth, async (req, res) => {
    try {
        const story = await SuccessStory.findById(req.params.id);
        if (!story) {
            return res.status(404).json({ message: 'Success story not found' });
        }

        // Check if user already liked
        if (story.likedBy.includes(req.user._id)) {
            return res.status(400).json({ message: 'You have already liked this story' });
        }

        story.likes += 1;
        story.likedBy.push(req.user._id);
        await story.save();

        res.json({ message: 'Story liked successfully', likes: story.likes });
    } catch (error) {
        console.error('Like success story error:', error);
        res.status(500).json({ message: 'Failed to like story' });
    }
});

// Unlike a success story
router.post('/:id/unlike', auth, async (req, res) => {
    try {
        const story = await SuccessStory.findById(req.params.id);
        if (!story) {
            return res.status(404).json({ message: 'Success story not found' });
        }

        // Check if user has liked
        if (!story.likedBy.includes(req.user._id)) {
            return res.status(400).json({ message: 'You have not liked this story' });
        }

        story.likes = Math.max(0, story.likes - 1);
        story.likedBy = story.likedBy.filter(id => id.toString() !== req.user._id.toString());
        await story.save();

        res.json({ message: 'Story unliked successfully', likes: story.likes });
    } catch (error) {
        console.error('Unlike success story error:', error);
        res.status(500).json({ message: 'Failed to unlike story' });
    }
});

// Admin-only routes
// Approve/reject success story
router.put('/:id/moderate', adminAuth, async (req, res) => {
    try {
        const { status, adminNotes, featuredRank } = req.body;

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const story = await SuccessStory.findById(req.params.id);
        if (!story) {
            return res.status(404).json({ message: 'Success story not found' });
        }

        story.status = status;

        if (adminNotes !== undefined) {
            story.adminNotes = adminNotes;
        }

        if (featuredRank !== undefined) {
            story.featuredRank = parseInt(featuredRank);
        }

        await story.save();

        // Log admin activity
        await logActivity({
            user: req.user._id,
            type: 'success_story_moderated',
            target: story._id,
            targetModel: 'SuccessStory',
            description: `Success story ${status}`,
            details: { status, adminNotes }
        });

        res.json({
            message: `Success story ${status} successfully`,
            story
        });
    } catch (error) {
        console.error('Moderate success story error:', error);
        res.status(500).json({ message: 'Failed to moderate story' });
    }
});

// Get stats for success stories
router.get('/stats/summary', adminAuth, async (req, res) => {
    try {
        const [
            totalCount,
            approvedCount,
            pendingCount,
            rejectedCount,
            featuredCount,
            totalViews,
            totalLikes
        ] = await Promise.all([
            SuccessStory.countDocuments(),
            SuccessStory.countDocuments({ status: 'approved' }),
            SuccessStory.countDocuments({ status: 'pending' }),
            SuccessStory.countDocuments({ status: 'rejected' }),
            SuccessStory.countDocuments({ featuredRank: { $gt: 0 } }),
            SuccessStory.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
            SuccessStory.aggregate([{ $group: { _id: null, total: { $sum: '$likes' } } }])
        ]);

        const averageTimeToMarriage = await SuccessStory.aggregate([
            { $match: { marriageDate: { $exists: true }, connectionDate: { $exists: true } } },
            {
                $project: {
                    daysDiff: {
                        $divide: [
                            { $subtract: ['$marriageDate', '$connectionDate'] },
                            1000 * 60 * 60 * 24
                        ]
                    }
                }
            },
            { $group: { _id: null, average: { $avg: '$daysDiff' } } }
        ]);

        res.json({
            totalCount,
            approvedCount,
            pendingCount,
            rejectedCount,
            featuredCount,
            totalViews: totalViews.length > 0 ? totalViews[0].total : 0,
            totalLikes: totalLikes.length > 0 ? totalLikes[0].total : 0,
            averageDaysToMarriage: averageTimeToMarriage.length > 0
                ? Math.round(averageTimeToMarriage[0].average)
                : null
        });
    } catch (error) {
        console.error('Get success story stats error:', error);
        res.status(500).json({ message: 'Failed to get success story statistics' });
    }
});

module.exports = router;
