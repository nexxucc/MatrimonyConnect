const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    basicInfo: {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        dateOfBirth: {
            type: Date,
            required: true
        },
        gender: {
            type: String,
            enum: ['male', 'female'],
            required: true
        },
        height: {
            type: Number, // in cm
            min: 100,
            max: 250
        },
        weight: {
            type: Number, // in kg
            min: 30,
            max: 200
        },
        maritalStatus: {
            type: String,
            enum: ['never_married', 'divorced', 'widowed', 'awaiting_divorce'],
            required: true
        },
        children: {
            type: String,
            enum: ['no', 'yes_living_with_me', 'yes_not_living_with_me'],
            default: 'no'
        }
    },
    location: {
        country: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        address: String,
        timezone: String
    },
    religiousInfo: {
        religion: {
            type: String,
            required: true
        },
        caste: String,
        subCaste: String,
        gothra: String,
        nakshatra: String,
        rashi: String,
        manglik: {
            type: String,
            enum: ['yes', 'no', 'dont_know'],
            default: 'dont_know'
        }
    },
    education: {
        highestQualification: {
            type: String,
            required: true
        },
        institution: String,
        fieldOfStudy: String,
        graduationYear: Number
    },
    career: {
        profession: {
            type: String,
            required: true
        },
        company: String,
        designation: String,
        income: {
            type: String,
            enum: ['below_5_lakhs', '5_10_lakhs', '10_15_lakhs', '15_25_lakhs', '25_50_lakhs', 'above_50_lakhs'],
            required: true
        },
        workLocation: String
    },
    family: {
        familyType: {
            type: String,
            enum: ['joint', 'nuclear', 'extended'],
            default: 'nuclear'
        },
        familyStatus: {
            type: String,
            enum: ['middle_class', 'upper_middle_class', 'rich', 'affluent'],
            default: 'middle_class'
        },
        familyValues: {
            type: String,
            enum: ['traditional', 'moderate', 'liberal'],
            default: 'moderate'
        },
        fatherName: String,
        motherName: String,
        siblings: {
            brothers: { type: Number, default: 0 },
            sisters: { type: Number, default: 0 }
        }
    },
    lifestyle: {
        diet: {
            type: String,
            enum: ['vegetarian', 'non_vegetarian', 'eggetarian', 'vegan'],
            default: 'vegetarian'
        },
        smoking: {
            type: String,
            enum: ['never', 'occasionally', 'regularly'],
            default: 'never'
        },
        drinking: {
            type: String,
            enum: ['never', 'occasionally', 'regularly'],
            default: 'never'
        },
        hobbies: [String],
        languages: [String]
    },
    photos: [{
        url: String,
        isPrimary: { type: Boolean, default: false },
        isApproved: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now }
    }],
    preferences: {
        ageRange: {
            min: { type: Number, min: 18, max: 80 },
            max: { type: Number, min: 18, max: 80 }
        },
        heightRange: {
            min: { type: Number, min: 100, max: 250 },
            max: { type: Number, min: 100, max: 250 }
        },
        religions: [String],
        castes: [String],
        locations: [String],
        education: [String],
        professions: [String],
        incomeRange: {
            min: String,
            max: String
        },
        maritalStatus: [String]
    },
    about: {
        description: String,
        partnerExpectations: String,
        familyBackground: String
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    isProfileApproved: {
        type: Boolean,
        default: false
    },
    profileScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    privacySettings: {
        showPhotos: { type: Boolean, default: true },
        showContact: { type: Boolean, default: false },
        showIncome: { type: Boolean, default: true },
        showLocation: { type: Boolean, default: true },
        isHidden: { type: Boolean, default: false },
        whoCanContact: { type: String, enum: ['all', 'matches', 'none'], default: 'all' }
    },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reports: [
        {
            reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            reason: String,
            details: String,
            createdAt: { type: Date, default: Date.now }
        }
    ],
    isVerified: { type: Boolean, default: false },
    boostedUntil: { type: Date }
}, {
    timestamps: true
});

// Indexes for better search performance
profileSchema.index({ 'basicInfo.gender': 1, 'basicInfo.dateOfBirth': 1 });
profileSchema.index({ 'location.city': 1, 'location.state': 1 });
profileSchema.index({ 'religiousInfo.religion': 1, 'religiousInfo.caste': 1 });
profileSchema.index({ 'career.profession': 1, 'career.income': 1 });
profileSchema.index({ isProfileApproved: 1, isActive: 1 });

// Virtual for age calculation
profileSchema.virtual('age').get(function () {
    if (!this.basicInfo.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.basicInfo.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

// Ensure virtual fields are serialized
profileSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Profile', profileSchema); 