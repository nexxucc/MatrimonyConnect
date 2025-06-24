const mongoose = require('mongoose');

const SuccessStorySchema = new mongoose.Schema({
    primaryProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    partnerProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    story: {
        type: String,
        required: true
    },
    marriageDate: {
        type: Date
    },
    connectionDate: {
        type: Date
    },
    photos: [
        {
            url: String,
            caption: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            },
            isApproved: {
                type: Boolean,
                default: false
            }
        }
    ],
    coverPhoto: {
        type: String
    },
    isPlatformMatch: {
        type: Boolean,
        default: true
    },
    testimonial: {
        type: String
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    featuredRank: {
        type: Number,
        default: 0 // 0 means not featured, higher numbers indicate priority in featured list
    },
    visibilityPreference: {
        type: String,
        enum: ['public', 'registered_users', 'private'],
        default: 'public'
    },
    adminNotes: {
        type: String
    },
    tags: [String],
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, {
    timestamps: true
});

// Virtual for calculating how long it took to get married after initial connection
SuccessStorySchema.virtual('timeToMarriage').get(function () {
    if (this.marriageDate && this.connectionDate) {
        return (this.marriageDate - this.connectionDate) / (1000 * 60 * 60 * 24); // Return days
    }
    return null;
});

// Method to increment view count
SuccessStorySchema.methods.incrementViews = async function () {
    this.views += 1;
    return this.save();
};

// Static to get featured stories
SuccessStorySchema.statics.getFeaturedStories = function (limit = 10) {
    return this.find({
        status: 'approved',
        featuredRank: { $gt: 0 },
        visibilityPreference: { $in: ['public', 'registered_users'] }
    })
        .sort({ featuredRank: -1 })
        .limit(limit)
        .populate('primaryProfile', 'basicInfo photos')
        .populate('partnerProfile', 'basicInfo photos');
};

// Static method to get recent success stories
SuccessStorySchema.statics.getRecentStories = function (limit = 10) {
    return this.find({
        status: 'approved',
        visibilityPreference: { $in: ['public', 'registered_users'] }
    })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('primaryProfile', 'basicInfo photos')
        .populate('partnerProfile', 'basicInfo photos');
};

// Add text index for search
SuccessStorySchema.index({ title: 'text', story: 'text', testimonial: 'text', tags: 'text' });

const SuccessStory = mongoose.model('SuccessStory', SuccessStorySchema);

module.exports = SuccessStory;
