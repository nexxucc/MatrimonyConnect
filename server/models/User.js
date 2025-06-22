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
        enum: ['user', 'admin', 'premium'],
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
            enum: ['free', 'basic', 'premium'],
            default: 'free'
        },
        startDate: Date,
        endDate: Date,
        isActive: {
            type: Boolean,
            default: false
        }
    },
    preferences: {
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            push: { type: Boolean, default: true }
        },
        privacy: {
            profileVisibility: { type: String, enum: ['public', 'private', 'friends'], default: 'public' },
            showOnlineStatus: { type: Boolean, default: true }
        }
    },
    savedSearches: [{ type: Object }],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
    name: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['male', 'female']
    },
    // OTPs for phone and email verification
    phoneOtp: { type: String },
    phoneOtpExpiresAt: { type: Date },
    emailOtp: { type: String },
    emailOtpExpiresAt: { type: Date },
    // Store normalized email for lookup
    emailNormalized: { type: String, index: true }
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
    return user;
};

// Save normalized email before saving
userSchema.pre('save', function (next) {
    if (this.isModified('email')) {
        this.emailNormalized = normalizeGmail(this.email);
    }
    next();
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

module.exports = mongoose.model('User', userSchema);