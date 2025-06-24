const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'premium', 'moderator'],
        default: 'user'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'basic', 'premium', 'gold', 'platinum'],
            default: 'free'
        },
        startDate: Date,
        endDate: Date,
        isActive: {
            type: Boolean,
            default: false
        },
        autoRenew: {
            type: Boolean,
            default: false
        },
        paymentMethod: {
            type: String,
            enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet', 'other']
        },
        transactionId: String,
        features: {
            messageCount: { type: Number, default: 0 }, // Total messages allowed
            messagesUsed: { type: Number, default: 0 }, // Messages used
            profileViews: { type: Number, default: 0 }, // Number of profiles viewed
            contactsVisible: { type: Boolean, default: false }, // Can view contact details
            advancedSearch: { type: Boolean, default: false }, // Can use advanced search
            priorityListing: { type: Boolean, default: false }, // Profile appears in priority listings
            highlightProfile: { type: Boolean, default: false }, // Profile gets highlighted
            instantChat: { type: Boolean, default: false }, // Can chat instantly
            videoCall: { type: Boolean, default: false }, // Can video call
            horoscopeMatch: { type: Boolean, default: false } // Can do horoscope matching
        }
    },
    preferences: {
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            matches: { type: Boolean, default: true },
            interests: { type: Boolean, default: true },
            messages: { type: Boolean, default: true },
            profileViews: { type: Boolean, default: true },
            events: { type: Boolean, default: true },
            newsletter: { type: Boolean, default: true }
        },
        privacy: {
            profileVisibility: { type: String, enum: ['public', 'private', 'premium', 'matches'], default: 'public' },
            showOnlineStatus: { type: Boolean, default: true },
            showLastActive: { type: Boolean, default: true },
            showProfileView: { type: Boolean, default: true }
        },
        emailFrequency: {
            type: String,
            enum: ['daily', 'weekly', 'biweekly', 'monthly', 'none'],
            default: 'weekly'
        }
    },
    savedSearches: [{
        name: String,
        filters: { type: Object },
        notifyNewMatches: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
    recentlyViewed: [{
        profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
        viewedAt: { type: Date, default: Date.now }
    }],
    name: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other']
    },
    // OTPs for phone and email verification
    phoneOtp: { type: String },
    phoneOtpExpiresAt: { type: Date },
    emailOtp: { type: String },
    emailOtpExpiresAt: { type: Date },
    // Store normalized email for lookup
    emailNormalized: { type: String, index: true },
    // Account security and activity
    loginHistory: [{
        timestamp: { type: Date, default: Date.now },
        ipAddress: String,
        deviceInfo: String,
        location: String
    }],
    accountActions: [{
        action: {
            type: String,
            enum: ['profile_edit', 'password_change', 'login_failed', 'subscription_change', 'photo_upload']
        },
        timestamp: { type: Date, default: Date.now },
        details: String
    }],
    // Referral system
    referral: {
        code: String,
        referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        referredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        rewards: Number
    },
    // For family-created accounts
    createdFor: {
        isCreatedByFamily: { type: Boolean, default: false },
        relationToUser: {
            type: String,
            enum: ['self', 'son', 'daughter', 'brother', 'sister', 'relative']
        },
        creatorName: String,
        creatorContact: String
    },
    // User app settings
    appSettings: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system'
        },
        language: {
            type: String,
            default: 'en' // English default
        },
        timezone: String,
        // For accessibility features
        fontSize: {
            type: String,
            enum: ['small', 'medium', 'large'],
            default: 'medium'
        },
        colorBlindMode: { type: Boolean, default: false }
    },
    // Account status
    accountStatus: {
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended', 'under_review', 'deleted'],
            default: 'active'
        },
        inactiveReason: String,
        suspensionReason: String,
        suspendedUntil: Date
    },
    deletionRequest: {
        requested: { type: Boolean, default: false },
        requestDate: Date,
        scheduledDeletionDate: Date,
        reason: String
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.phoneOtp;
    delete user.emailOtp;
    delete user.phoneOtpExpiresAt;
    delete user.emailOtpExpiresAt;
    return user;
};

// Save normalized email before saving
userSchema.pre('save', function (next) {
    if (this.isModified('email')) {
        this.emailNormalized = normalizeGmail(this.email);
    }
    next();
});

// Generate unique referral code when a new user is created
userSchema.pre('save', function (next) {
    if (this.isNew && !this.referral.code) {
        // Generate a unique referral code - first initial + last initial + random alphanumeric
        const firstInitial = this.name.charAt(0);
        const lastInitial = this.name.includes(' ') ?
            this.name.split(' ')[this.name.split(' ').length - 1].charAt(0) : 'X';

        const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
        this.referral.code = `${firstInitial}${lastInitial}${randomPart}`;
    }
    next();
});

// Check if subscription is expired
userSchema.virtual('isSubscriptionActive').get(function () {
    if (!this.subscription.isActive) return false;

    const now = new Date();
    return this.subscription.endDate && new Date(this.subscription.endDate) > now;
});

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

// Indexes for better performance
userSchema.index({ emailNormalized: 1 });
userSchema.index({ 'subscription.plan': 1 });
userSchema.index({ 'accountStatus.status': 1 });
userSchema.index({ name: 'text' });

module.exports = mongoose.model('User', userSchema);