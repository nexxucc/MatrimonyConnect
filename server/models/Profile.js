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
            enum: ['male', 'female', 'other'],
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
            enum: ['never_married', 'divorced', 'widowed', 'awaiting_divorce', 'annulled'],
            required: true
        },
        children: {
            type: String,
            enum: ['no', 'yes_living_with_me', 'yes_not_living_with_me', 'yes_planning_to_have'],
            default: 'no'
        },
        bloodGroup: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Not sure']
        },
        physicalStatus: {
            type: String,
            enum: ['normal', 'physically_challenged'],
            default: 'normal'
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
        timezone: String,
        residencyStatus: {
            type: String,
            enum: ['citizen', 'permanent_resident', 'work_visa', 'student_visa', 'temporary_visa']
        },
        yearsLivingHere: Number,
        willingToRelocate: {
            type: Boolean,
            default: true
        }
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
        },
        motherTongue: String,
        religiosity: {
            type: String,
            enum: ['very_religious', 'religious', 'not_religious', 'spiritual_but_not_religious'],
            default: 'religious'
        },
        communityValue: {
            type: String,
            enum: ['very_important', 'important', 'not_important'],
            default: 'important'
        }
    },
    education: {
        highestQualification: {
            type: String,
            required: true
        },
        institution: String,
        fieldOfStudy: String,
        graduationYear: Number,
        additionalDegrees: [{
            degree: String,
            institution: String,
            year: Number,
            fieldOfStudy: String
        }]
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
            enum: ['below_5_lakhs', '5_10_lakhs', '10_15_lakhs', '15_25_lakhs', '25_50_lakhs', '50_75_lakhs', '75_100_lakhs', 'above_100_lakhs', 'prefer_not_to_say'],
            required: true
        },
        workLocation: String,
        workExperience: Number, // in years
        workingHours: {
            type: String,
            enum: ['regular', 'flexible', 'work_from_home', 'shifts']
        },
        careerAmbitions: String
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
        fatherOccupation: String,
        motherName: String,
        motherOccupation: String,
        siblings: {
            brothers: { type: Number, default: 0 },
            marriedBrothers: { type: Number, default: 0 },
            sisters: { type: Number, default: 0 },
            marriedSisters: { type: Number, default: 0 }
        },
        familyLivingWith: {
            type: Boolean,
            default: true
        },
        ancestralProperty: {
            type: String,
            enum: ['yes', 'no', 'shared'],
            default: 'no'
        }
    },
    lifestyle: {
        diet: {
            type: String,
            enum: ['vegetarian', 'non_vegetarian', 'eggetarian', 'vegan', 'jain', 'vegetarian_occasionally_non_veg'],
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
        languages: [String],
        interests: [String],
        fitness: {
            type: String,
            enum: ['very_active', 'active', 'moderate', 'not_active'],
            default: 'moderate'
        },
        pets: {
            type: String,
            enum: ['have', 'dont_have_but_love', 'dont_like'],
            default: 'dont_have_but_love'
        },
        ownsHouse: {
            type: Boolean,
            default: false
        },
        ownsCar: {
            type: Boolean,
            default: false
        }
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
        motherTongues: [String],
        locations: [String],
        countries: [String],
        education: [String],
        professions: [String],
        incomeRange: {
            min: String,
            max: String
        },
        maritalStatus: [String],
        dietPreference: [String],
        smokingPreference: {
            type: String,
            enum: ['yes', 'no', 'doesnt_matter'],
            default: 'doesnt_matter'
        },
        drinkingPreference: {
            type: String,
            enum: ['yes', 'no', 'doesnt_matter'],
            default: 'doesnt_matter'
        },
        manglikPreference: {
            type: String,
            enum: ['yes', 'no', 'doesnt_matter'],
            default: 'doesnt_matter'
        },
        religiosityPreference: {
            type: String,
            enum: ['very_religious', 'religious', 'not_religious', 'doesnt_matter'],
            default: 'doesnt_matter'
        },
        lookingFor: {
            type: String,
            default: "I'm looking for someone who is honest, caring, and values family."
        }
    },
    horoscope: {
        hasHoroscope: {
            type: Boolean,
            default: false
        },
        birthTime: Date,
        birthPlace: String,
        rashiLord: String,
        nakshatra: String,
        manglik: {
            type: String,
            enum: ['yes', 'no', 'partially', 'dont_know'],
            default: 'dont_know'
        },
        horoscopeDocUrl: String
    },
    verification: {
        idVerified: {
            type: Boolean,
            default: false
        },
        idType: {
            type: String,
            enum: ['passport', 'driving_license', 'voter_id', 'aadhar', 'pan_card', 'other']
        },
        educationVerified: {
            type: Boolean,
            default: false
        },
        incomeVerified: {
            type: Boolean,
            default: false
        },
        addressVerified: {
            type: Boolean,
            default: false
        },
        phoneVerified: {
            type: Boolean,
            default: false
        },
        emailVerified: {
            type: Boolean,
            default: false
        }
    },
    about: {
        description: String,
        partnerExpectations: String,
        familyBackground: String,
        aboutCareer: String,
        lifeGoals: String
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
        whoCanContact: { type: String, enum: ['all', 'matches', 'none'], default: 'all' },
        showHoroscope: { type: Boolean, default: false },
        showSocials: { type: Boolean, default: false }
    },
    socialProfiles: {
        facebook: String,
        instagram: String,
        linkedin: String
    },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reports: [
        {
            reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            reason: String,
            details: String,
            createdAt: { type: Date, default: Date.now },
            status: {
                type: String,
                enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
                default: 'pending'
            }
        }
    ],
    isVerified: { type: Boolean, default: false },
    boostedUntil: { type: Date },
    successStory: {
        hasSuccessStory: { type: Boolean, default: false },
        partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
        storyContent: String,
        weddingDate: Date,
        photos: [String],
        isApproved: { type: Boolean, default: false }
    },
    profileCompletionSteps: {
        basicInfoCompleted: { type: Boolean, default: false },
        photosUploaded: { type: Boolean, default: false },
        religionInfoCompleted: { type: Boolean, default: false },
        educationCompleted: { type: Boolean, default: false },
        careerCompleted: { type: Boolean, default: false },
        familyInfoCompleted: { type: Boolean, default: false },
        lifestyleCompleted: { type: Boolean, default: false },
        preferencesCompleted: { type: Boolean, default: false },
        aboutCompleted: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

// Indexes for better search performance
profileSchema.index({ 'basicInfo.gender': 1, 'basicInfo.dateOfBirth': 1 });
profileSchema.index({ 'location.city': 1, 'location.state': 1 });
profileSchema.index({ 'location.country': 1, 'location.state': 1, 'location.city': 1 });
profileSchema.index({ 'religiousInfo.religion': 1, 'religiousInfo.caste': 1 });
profileSchema.index({ 'religiousInfo.religion': 1, 'religiousInfo.motherTongue': 1 });
profileSchema.index({ 'career.profession': 1, 'career.income': 1 });
profileSchema.index({ 'education.highestQualification': 1 });
profileSchema.index({ isProfileApproved: 1, isActive: 1 });
profileSchema.index({ isProfileComplete: 1 });
profileSchema.index({ 'verification.idVerified': 1 });

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

// Calculate profile completion percentage
profileSchema.virtual('completionPercentage').get(function () {
    const completionSteps = this.profileCompletionSteps;
    const totalSteps = 9; // Total number of steps
    let completedSteps = 0;

    if (completionSteps.basicInfoCompleted) completedSteps++;
    if (completionSteps.photosUploaded) completedSteps++;
    if (completionSteps.religionInfoCompleted) completedSteps++;
    if (completionSteps.educationCompleted) completedSteps++;
    if (completionSteps.careerCompleted) completedSteps++;
    if (completionSteps.familyInfoCompleted) completedSteps++;
    if (completionSteps.lifestyleCompleted) completedSteps++;
    if (completionSteps.preferencesCompleted) completedSteps++;
    if (completionSteps.aboutCompleted) completedSteps++;

    return Math.round((completedSteps / totalSteps) * 100);
});

// Ensure virtual fields are serialized
profileSchema.set('toJSON', { virtuals: true });
profileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Profile', profileSchema);