const express = require('express');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { premiumCheck } = require('../middleware/premium');
const router = express.Router();

// Advanced Search Profiles with Pagination
router.get('/', auth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            gender,
            ageMin,
            ageMax,
            heightMin,
            heightMax,
            religion,
            caste,
            subCaste,
            motherTongue,
            country,
            state,
            city,
            maritalStatus,
            education,
            profession,
            income,
            diet,
            smoking,
            drinking,
            manglik,
            sortBy = 'lastActive',
            sortOrder = 'desc',
            verifiedProfiles,
            withPhotos,
            recentlyActive,
            premiumProfiles,
            horoscope,
            religiosity,
            familyValues,
            physicalStatus
        } = req.query;

        // Get user's profile to determine search criteria
        const userProfile = await Profile.findOne({ userId: req.user._id });
        if (!userProfile) {
            return res.status(404).json({ message: 'Please complete your profile first' });
        }

        // Build search query
        const query = {
            userId: { $ne: req.user._id }, // Exclude own profile
            isProfileApproved: true,
            isProfileComplete: true,
            'privacySettings.isHidden': { $ne: true } // Don't show hidden profiles
        };

        // Gender filter (opposite gender by default, or specified gender)
        if (gender) {
            query['basicInfo.gender'] = gender;
        } else if (userProfile.basicInfo.gender) {
            query['basicInfo.gender'] = userProfile.basicInfo.gender === 'male' ? 'female' : 'male';
        }

        // Age filter
        if (ageMin || ageMax) {
            const today = new Date();
            const minDate = ageMax ? new Date(today.getFullYear() - parseInt(ageMax) - 1, today.getMonth(), today.getDate()) : null;
            const maxDate = ageMin ? new Date(today.getFullYear() - parseInt(ageMin), today.getMonth(), today.getDate()) : null;

            if (minDate && maxDate) {
                query['basicInfo.dateOfBirth'] = { $gte: minDate, $lte: maxDate };
            } else if (minDate) {
                query['basicInfo.dateOfBirth'] = { $gte: minDate };
            } else if (maxDate) {
                query['basicInfo.dateOfBirth'] = { $lte: maxDate };
            }
        }

        // Height filter
        if (heightMin || heightMax) {
            query['basicInfo.height'] = {};
            if (heightMin) query['basicInfo.height'].$gte = parseInt(heightMin);
            if (heightMax) query['basicInfo.height'].$lte = parseInt(heightMax);
        }

        // Religion filter
        if (religion) {
            query['religiousInfo.religion'] = { $in: religion.split(',') };
        }

        // Caste filter
        if (caste) {
            query['religiousInfo.caste'] = { $in: caste.split(',') };
        }

        // Sub-caste filter
        if (subCaste) {
            query['religiousInfo.subCaste'] = { $in: subCaste.split(',') };
        }

        // Mother tongue filter
        if (motherTongue) {
            query['religiousInfo.motherTongue'] = { $in: motherTongue.split(',') };
        }

        // Location filters
        if (country) {
            query['location.country'] = { $in: country.split(',') };
        }

        if (state) {
            query['location.state'] = { $in: state.split(',') };
        }

        if (city) {
            query['location.city'] = { $in: city.split(',') };
        }

        // Education filter
        if (education) {
            query['education.highestQualification'] = { $in: education.split(',') };
        }

        // Profession filter
        if (profession) {
            query['career.profession'] = { $in: profession.split(',') };
        }

        // Income filter
        if (income) {
            query['career.income'] = { $in: income.split(',') };
        }

        // Marital status filter
        if (maritalStatus) {
            query['basicInfo.maritalStatus'] = { $in: maritalStatus.split(',') };
        }

        // Diet preference filter
        if (diet) {
            query['lifestyle.diet'] = { $in: diet.split(',') };
        }

        // Smoking preference filter
        if (smoking) {
            query['lifestyle.smoking'] = { $in: smoking.split(',') };
        }

        // Drinking preference filter
        if (drinking) {
            query['lifestyle.drinking'] = { $in: drinking.split(',') };
        }

        // Manglik filter
        if (manglik) {
            query['religiousInfo.manglik'] = manglik;
        }

        // Religiosity filter
        if (religiosity) {
            query['religiousInfo.religiosity'] = { $in: religiosity.split(',') };
        }

        // Family values filter
        if (familyValues) {
            query['family.familyValues'] = { $in: familyValues.split(',') };
        }

        // Physical status filter
        if (physicalStatus) {
            query['basicInfo.physicalStatus'] = { $in: physicalStatus.split(',') };
        }

        // Verified profiles only
        if (verifiedProfiles === 'true') {
            query['verification.idVerified'] = true;
        }

        // With photos only
        if (withPhotos === 'true') {
            query['photos'] = { $elemMatch: { isApproved: true } };
        }

        // With horoscope only
        if (horoscope === 'true') {
            query['horoscope.hasHoroscope'] = true;
        }

        // Recently active
        if (recentlyActive === 'true') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            query['lastActive'] = { $gte: thirtyDaysAgo };
        }

        // Premium profiles only (requires querying User model to match subscription)
        const premiumUserIds = [];
        if (premiumProfiles === 'true') {
            const premiumUsers = await User.find({
                'subscription.plan': { $in: ['premium', 'gold', 'platinum'] },
                'subscription.isActive': true,
                'subscription.endDate': { $gt: new Date() }
            }).select('_id');

            premiumUserIds.push(...premiumUsers.map(user => user._id));

            if (premiumUserIds.length > 0) {
                query['userId'] = { $in: premiumUserIds };
            } else {
                // If no premium users found, return empty results
                return res.json({
                    profiles: [],
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: 0,
                        totalResults: 0,
                        hasNext: false,
                        hasPrev: false
                    }
                });
            }
        }

        // Build sort object
        let sort = {};
        switch (sortBy) {
            case 'age':
                sort['basicInfo.dateOfBirth'] = sortOrder === 'desc' ? 1 : -1; // Older first for desc
                break;
            case 'recentlyJoined':
                sort['createdAt'] = sortOrder === 'desc' ? -1 : 1;
                break;
            case 'lastActive':
                sort['lastActive'] = sortOrder === 'desc' ? -1 : 1;
                break;
            case 'height':
                sort['basicInfo.height'] = sortOrder === 'desc' ? -1 : 1;
                break; case 'income': {
                    // Income sorting logic
                    let incomeOrder = {
                        'below_5_lakhs': 1,
                        '5_10_lakhs': 2,
                        '10_15_lakhs': 3,
                        '15_25_lakhs': 4,
                        '25_50_lakhs': 5,
                        '50_75_lakhs': 6,
                        '75_100_lakhs': 7,
                        'above_100_lakhs': 8
                    };                // Using aggregation for income sorting
                    let aggregationPipeline = [
                        { $match: query },
                        {
                            $addFields: {
                                incomeOrder: {
                                    $switch: {
                                        branches: [
                                            { case: { $eq: ["$career.income", "below_5_lakhs"] }, then: 1 },
                                            { case: { $eq: ["$career.income", "5_10_lakhs"] }, then: 2 },
                                            { case: { $eq: ["$career.income", "10_15_lakhs"] }, then: 3 },
                                            { case: { $eq: ["$career.income", "15_25_lakhs"] }, then: 4 },
                                            { case: { $eq: ["$career.income", "25_50_lakhs"] }, then: 5 },
                                            { case: { $eq: ["$career.income", "50_75_lakhs"] }, then: 6 },
                                            { case: { $eq: ["$career.income", "75_100_lakhs"] }, then: 7 },
                                            { case: { $eq: ["$career.income", "above_100_lakhs"] }, then: 8 }
                                        ],
                                        default: 0
                                    }
                                }
                            }
                        },
                        { $sort: { incomeOrder: sortOrder === 'desc' ? -1 : 1 } },
                        { $skip: (parseInt(page) - 1) * parseInt(limit) },
                        { $limit: parseInt(limit) }
                    ];

                    if (sortBy === 'income') {
                        // Execute aggregation pipeline
                        const profiles = await Profile.aggregate(aggregationPipeline);
                        const profileIds = profiles.map(p => p._id);

                        // Fetch full profiles with populated data
                        const populatedProfiles = await Profile.find({ _id: { $in: profileIds } })
                            .populate('userId', 'email phone role subscription')
                            .select('-about.partnerExpectations -about.familyBackground');

                        const total = await Profile.countDocuments(query);

                        // Apply privacy settings
                        const publicProfiles = applyPrivacySettings(populatedProfiles);

                        return res.json({
                            profiles: publicProfiles,
                            pagination: {
                                currentPage: parseInt(page),
                                totalPages: Math.ceil(total / parseInt(limit)),
                                totalResults: total,
                                hasNext: parseInt(page) * parseInt(limit) < total,
                                hasPrev: parseInt(page) > 1
                            }
                        });
                    }
                    break;
                }
            case 'relevance': { // Special case for relevance-based sorting                // Default to lastActive which gets overridden in case of relevance sort
                sort = { lastActive: -1 };
                break;
            }
            default: {
                sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
            }
        }

        // Execute search
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Special case for relevance based sorting
        if (sortBy === 'relevance') {
            // Get user's preferences to calculate relevance
            const userPrefs = userProfile.preferences || {};

            // Create aggregation for relevance sorting based on matching preferences
            const aggregatePipeline = [
                { $match: query },
                {
                    $addFields: {
                        relevanceScore: {
                            $sum: [
                                // Match on religion
                                {
                                    $cond: [
                                        {
                                            $and: [
                                                { $isArray: "$religiousInfo.religion" },
                                                { $in: ["$religiousInfo.religion", userPrefs.religions || []] }
                                            ]
                                        },
                                        10, 0
                                    ]
                                },
                                // Match on caste
                                {
                                    $cond: [
                                        {
                                            $and: [
                                                { $isArray: "$religiousInfo.caste" },
                                                { $in: ["$religiousInfo.caste", userPrefs.castes || []] }
                                            ]
                                        },
                                        8, 0
                                    ]
                                },
                                // Match on location
                                {
                                    $cond: [
                                        {
                                            $and: [
                                                { $isArray: "$location.city" },
                                                { $in: ["$location.city", userPrefs.locations || []] }
                                            ]
                                        },
                                        6, 0
                                    ]
                                },
                                // Match on education
                                {
                                    $cond: [
                                        {
                                            $and: [
                                                { $isArray: "$education.highestQualification" },
                                                { $in: ["$education.highestQualification", userPrefs.education || []] }
                                            ]
                                        },
                                        5, 0
                                    ]
                                },
                                // Recently active bonus
                                {
                                    $cond: [
                                        { $gte: ["$lastActive", new Date(new Date().setDate(new Date().getDate() - 7))] },
                                        3, 0
                                    ]
                                },
                                // Has photos bonus
                                {
                                    $cond: [
                                        { $gt: [{ $size: { $ifNull: ["$photos", []] } }, 0] },
                                        2, 0
                                    ]
                                },
                                // Verified profile bonus
                                { $cond: [{ $eq: ["$verification.idVerified", true] }, 2, 0] }
                            ]
                        }
                    }
                },
                { $sort: { relevanceScore: -1, lastActive: -1 } },
                { $skip: skip },
                { $limit: parseInt(limit) }
            ];

            // Execute the aggregation
            const relevantProfiles = await Profile.aggregate(aggregatePipeline);

            // Get the IDs of the matching profiles
            const profileIds = relevantProfiles.map(p => p._id);

            // Fetch full profiles with populated data
            const populatedProfiles = await Profile.find({ _id: { $in: profileIds } })
                .populate('userId', 'email phone role subscription')
                .select('-about.partnerExpectations -about.familyBackground');

            // Count total matching profiles
            const total = await Profile.countDocuments(query);

            // Apply privacy settings
            const publicProfiles = applyPrivacySettings(populatedProfiles);

            return res.json({
                profiles: publicProfiles,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / parseInt(limit)),
                    totalResults: total,
                    hasNext: parseInt(page) * parseInt(limit) < total,
                    hasPrev: parseInt(page) > 1
                }
            });
        }

        // Standard sorting for non-special cases
        const profiles = await Profile.find(query)
            .populate('userId', 'email phone role subscription')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-about.partnerExpectations -about.familyBackground');

        // Get total count
        const total = await Profile.countDocuments(query);

        // Apply privacy settings to results
        const publicProfiles = applyPrivacySettings(profiles);

        res.json({
            profiles: publicProfiles,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalResults: total,
                hasNext: parseInt(page) * parseInt(limit) < total,
                hasPrev: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Search failed', error: error.message });
    }
});

// Helper function to apply privacy settings
function applyPrivacySettings(profiles) {
    return profiles.map(profile => {
        const publicProfile = { ...profile.toObject() };

        // Hide sensitive information based on privacy settings
        if (!profile.privacySettings.showContact) {
            if (publicProfile.userId) {
                publicProfile.userId.phone = undefined;
                publicProfile.userId.email = undefined;
            }
        }

        if (!profile.privacySettings.showIncome) {
            if (publicProfile.career) {
                publicProfile.career.income = undefined;
            }
        }

        if (!profile.privacySettings.showLocation) {
            if (publicProfile.location) {
                publicProfile.location.address = undefined;
                publicProfile.location.city = undefined;
                publicProfile.location.state = undefined;
            }
        }

        if (!profile.privacySettings.showHoroscope) {
            publicProfile.horoscope = undefined;
        }

        if (!profile.privacySettings.showSocials) {
            publicProfile.socialProfiles = undefined;
        }

        return publicProfile;
    });
}

// Get Daily Matches
router.get('/daily-matches', auth, async (req, res) => {
    try {
        const userProfile = await Profile.findOne({ userId: req.user._id });
        if (!userProfile) {
            return res.status(404).json({ message: 'Please complete your profile first' });
        }

        // Build match criteria based on user preferences
        const query = {
            userId: { $ne: req.user._id },
            isProfileApproved: true,
            isProfileComplete: true,
            'privacySettings.isHidden': { $ne: true }
        };

        // Gender filter
        if (userProfile.basicInfo.gender) {
            query['basicInfo.gender'] = userProfile.basicInfo.gender === 'male' ? 'female' : 'male';
        }

        // Age range from preferences
        if (userProfile.preferences.ageRange) {
            const today = new Date();
            const minDate = userProfile.preferences.ageRange.max ?
                new Date(today.getFullYear() - userProfile.preferences.ageRange.max - 1, today.getMonth(), today.getDate()) : null;
            const maxDate = userProfile.preferences.ageRange.min ?
                new Date(today.getFullYear() - userProfile.preferences.ageRange.min, today.getMonth(), today.getDate()) : null;

            if (minDate && maxDate) {
                query['basicInfo.dateOfBirth'] = { $gte: minDate, $lte: maxDate };
            }
        }

        // Height range from preferences
        if (userProfile.preferences.heightRange && userProfile.preferences?.heightRange?.min &&
            userProfile.preferences?.heightRange?.max) {
            query['basicInfo.height'] = {
                $gte: userProfile.preferences.heightRange.min,
                $lte: userProfile.preferences.heightRange.max
            };
        }

        // Religion from preferences
        if (userProfile.preferences.religions && userProfile.preferences.religions.length > 0) {
            query['religiousInfo.religion'] = { $in: userProfile.preferences.religions };
        }

        // Caste from preferences
        if (userProfile.preferences.castes && userProfile.preferences.castes.length > 0) {
            query['religiousInfo.caste'] = { $in: userProfile.preferences.castes };
        }

        // Mother tongue from preferences
        if (userProfile.preferences.motherTongues && userProfile.preferences.motherTongues.length > 0) {
            query['religiousInfo.motherTongue'] = { $in: userProfile.preferences.motherTongues };
        }

        // Location from preferences
        if (userProfile.preferences.locations && userProfile.preferences.locations.length > 0) {
            query['$or'] = userProfile.preferences.locations.map(location => ({
                'location.city': new RegExp(location, 'i')
            }));
        }

        // Countries from preferences
        if (userProfile.preferences.countries && userProfile.preferences.countries.length > 0) {
            query['location.country'] = { $in: userProfile.preferences.countries };
        }

        // Marital status from preferences
        if (userProfile.preferences.maritalStatus && userProfile.preferences.maritalStatus.length > 0) {
            query['basicInfo.maritalStatus'] = { $in: userProfile.preferences.maritalStatus };
        }

        // Diet preferences
        if (userProfile.preferences.dietPreference && userProfile.preferences.dietPreference.length > 0) {
            query['lifestyle.diet'] = { $in: userProfile.preferences.dietPreference };
        }

        // Smoking preference
        if (userProfile.preferences.smokingPreference && userProfile.preferences.smokingPreference !== 'doesnt_matter') {
            query['lifestyle.smoking'] = userProfile.preferences.smokingPreference === 'yes' ?
                { $in: ['occasionally', 'regularly'] } : 'never';
        }

        // Drinking preference
        if (userProfile.preferences.drinkingPreference && userProfile.preferences.drinkingPreference !== 'doesnt_matter') {
            query['lifestyle.drinking'] = userProfile.preferences.drinkingPreference === 'yes' ?
                { $in: ['occasionally', 'regularly'] } : 'never';
        }

        // Manglik preference
        if (userProfile.preferences.manglikPreference && userProfile.preferences.manglikPreference !== 'doesnt_matter') {
            query['religiousInfo.manglik'] = userProfile.preferences.manglikPreference;
        }

        // Defensive: Remove invalid dateOfBirth from query
        if (query['basicInfo.dateOfBirth']) {
            const { $gte, $lte } = query['basicInfo.dateOfBirth'];
            if (isNaN($gte?.getTime()) || isNaN($lte?.getTime())) {
                delete query['basicInfo.dateOfBirth'];
            }
        }

        // Get 10 daily matches
        const matches = await Profile.find(query)
            .populate('userId', 'email phone role subscription')
            .sort({ lastActive: -1, profileScore: -1 })
            .limit(10)
            .select('-about.partnerExpectations -about.familyBackground');

        // Apply privacy settings
        const publicMatches = applyPrivacySettings(matches);

        res.json({
            matches: publicMatches,
            count: publicMatches.length
        });

    } catch (error) {
        console.error('Daily matches error:', error);
        res.status(500).json({ message: 'Failed to get daily matches' });
    }
});

// Get Similar Profiles
router.get('/similar/:profileId', auth, async (req, res) => {
    try {
        const targetProfile = await Profile.findById(req.params.profileId);
        if (!targetProfile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Build similarity query
        const query = {
            _id: { $ne: req.params.profileId },
            userId: { $ne: req.user._id },
            isProfileApproved: true,
            isProfileComplete: true,
            'privacySettings.isHidden': { $ne: true }
        };

        // Match on key criteria
        if (targetProfile.religiousInfo.religion) {
            query['religiousInfo.religion'] = targetProfile.religiousInfo.religion;
        }

        if (targetProfile.location.city) {
            query['location.city'] = targetProfile.location.city;
        }

        if (targetProfile.education.highestQualification) {
            query['education.highestQualification'] = targetProfile.education.highestQualification;
        }

        // Age range (±5 years)
        const targetAge = targetProfile.age || 30; // Default to 30 if age virtual is not available
        const today = new Date();
        const minDate = new Date(today.getFullYear() - (targetAge + 5), today.getMonth(), today.getDate());
        const maxDate = new Date(today.getFullYear() - (targetAge - 5), today.getMonth(), today.getDate());
        query['basicInfo.dateOfBirth'] = { $gte: minDate, $lte: maxDate };

        // Get similar profiles
        const similarProfiles = await Profile.find(query)
            .populate('userId', 'email phone role subscription')
            .sort({ profileScore: -1 })
            .limit(5)
            .select('-about.partnerExpectations -about.familyBackground');

        // Apply privacy settings
        const publicProfiles = applyPrivacySettings(similarProfiles);

        res.json({
            similarProfiles: publicProfiles
        });

    } catch (error) {
        console.error('Similar profiles error:', error);
        res.status(500).json({ message: 'Failed to get similar profiles' });
    }
});

// Get Search Filters
router.get('/filters', auth, async (req, res) => {
    try {
        // Get distinct values for filters
        const religions = await Profile.distinct('religiousInfo.religion');
        const castes = await Profile.distinct('religiousInfo.caste');
        const subCastes = await Profile.distinct('religiousInfo.subCaste');
        const motherTongues = await Profile.distinct('religiousInfo.motherTongue');
        const cities = await Profile.distinct('location.city');
        const states = await Profile.distinct('location.state');
        const countries = await Profile.distinct('location.country');
        const educations = await Profile.distinct('education.highestQualification');
        const professions = await Profile.distinct('career.profession');
        const incomes = await Profile.distinct('career.income');
        const maritalStatuses = await Profile.distinct('basicInfo.maritalStatus');
        const diets = await Profile.distinct('lifestyle.diet');
        const familyValues = await Profile.distinct('family.familyValues');
        const religiosity = await Profile.distinct('religiousInfo.religiosity');

        res.json({
            filters: {
                religions: religions.filter(Boolean),
                castes: castes.filter(Boolean),
                subCastes: subCastes.filter(Boolean),
                motherTongues: motherTongues.filter(Boolean),
                cities: cities.filter(Boolean),
                states: states.filter(Boolean),
                countries: countries.filter(Boolean),
                educations: educations.filter(Boolean),
                professions: professions.filter(Boolean),
                incomes: incomes.filter(Boolean),
                maritalStatuses: maritalStatuses.filter(Boolean),
                diets: diets.filter(Boolean),
                familyValues: familyValues.filter(Boolean),
                religiosity: religiosity.filter(Boolean),
                height: [
                    { label: '4\'0" (122 cm)', value: 122 },
                    { label: '4\'1" (125 cm)', value: 125 },
                    { label: '4\'2" (127 cm)', value: 127 },
                    { label: '4\'3" (130 cm)', value: 130 },
                    { label: '4\'4" (132 cm)', value: 132 },
                    { label: '4\'5" (135 cm)', value: 135 },
                    { label: '4\'6" (137 cm)', value: 137 },
                    { label: '4\'7" (140 cm)', value: 140 },
                    { label: '4\'8" (142 cm)', value: 142 },
                    { label: '4\'9" (145 cm)', value: 145 },
                    { label: '4\'10" (147 cm)', value: 147 },
                    { label: '4\'11" (150 cm)', value: 150 },
                    { label: '5\'0" (152 cm)', value: 152 },
                    { label: '5\'1" (155 cm)', value: 155 },
                    { label: '5\'2" (157 cm)', value: 157 },
                    { label: '5\'3" (160 cm)', value: 160 },
                    { label: '5\'4" (163 cm)', value: 163 },
                    { label: '5\'5" (165 cm)', value: 165 },
                    { label: '5\'6" (168 cm)', value: 168 },
                    { label: '5\'7" (170 cm)', value: 170 },
                    { label: '5\'8" (173 cm)', value: 173 },
                    { label: '5\'9" (175 cm)', value: 175 },
                    { label: '5\'10" (178 cm)', value: 178 },
                    { label: '5\'11" (180 cm)', value: 180 },
                    { label: '6\'0" (183 cm)', value: 183 },
                    { label: '6\'1" (185 cm)', value: 185 },
                    { label: '6\'2" (188 cm)', value: 188 },
                    { label: '6\'3" (191 cm)', value: 191 },
                    { label: '6\'4" (193 cm)', value: 193 },
                    { label: '6\'5" (196 cm)', value: 196 },
                    { label: '6\'6" (198 cm)', value: 198 }
                ],
                age: Array.from({ length: 62 }, (_, i) => i + 18) // 18 to 80 years
            }
        });

    } catch (error) {
        console.error('Get filters error:', error);
        res.status(500).json({ message: 'Failed to get filters' });
    }
});

// Get Premium Partner Suggestions (Premium Feature)
router.get('/premium-matches', auth, premiumCheck, async (req, res) => {
    try {
        const userProfile = await Profile.findOne({ userId: req.user._id });
        if (!userProfile) {
            return res.status(404).json({ message: 'Please complete your profile first' });
        }

        // Use AI-like matching logic with more precise criteria
        // This would normally involve machine learning in a real system
        // but we simulate it with a more detailed matching algorithm

        // Get the top 20% of possible matches
        const query = {
            userId: { $ne: req.user._id },
            isProfileApproved: true,
            isProfileComplete: true,
            'privacySettings.isHidden': { $ne: true },
            'basicInfo.gender': userProfile.basicInfo.gender === 'male' ? 'female' : 'male'
        };

        // Apply core preferences from user profile
        if (userProfile.preferences.religions && userProfile.preferences.religions.length > 0) {
            query['religiousInfo.religion'] = { $in: userProfile.preferences.religions };
        }

        if (userProfile.preferences.ageRange) {
            const today = new Date();
            const minDate = userProfile.preferences.ageRange.max ?
                new Date(today.getFullYear() - userProfile.preferences.ageRange.max - 1, today.getMonth(), today.getDate()) : null;
            const maxDate = userProfile.preferences.ageRange.min ?
                new Date(today.getFullYear() - userProfile.preferences.ageRange.min, today.getMonth(), today.getDate()) : null;

            if (minDate && maxDate) {
                query['basicInfo.dateOfBirth'] = { $gte: minDate, $lte: maxDate };
            }
        }

        // Create a compatibility score for each potential match
        const matchPipeline = [
            { $match: query },
            {
                $addFields: {
                    compatibilityScore: {
                        $sum: [
                            // Education match - Higher weight for matching education levels
                            {
                                $cond: [
                                    { $in: ["$education.highestQualification", userProfile.preferences.education || []] },
                                    15, 0
                                ]
                            },
                            // Religion match - Very high weight for religion compatibility
                            {
                                $cond: [
                                    { $eq: ["$religiousInfo.religion", userProfile.religiousInfo.religion] },
                                    20, 0
                                ]
                            },
                            // Caste match - High weight if castes match
                            {
                                $cond: [
                                    { $in: ["$religiousInfo.caste", userProfile.preferences.castes || []] },
                                    15, 0
                                ]
                            },
                            // Location match - Moderate weight for location proximity
                            {
                                $cond: [
                                    { $in: ["$location.city", userProfile.preferences.locations || []] },
                                    10, 0
                                ]
                            },
                            // Family values match - Good weight for matching family values
                            {
                                $cond: [
                                    { $eq: ["$family.familyValues", userProfile.family.familyValues] },
                                    8, 0
                                ]
                            },
                            // Diet preferences match - Moderate weight for matching diet
                            {
                                $cond: [
                                    { $eq: ["$lifestyle.diet", userProfile.lifestyle.diet] },
                                    8, 0
                                ]
                            },
                            // Verified profile boost - Small bonus for verified profiles
                            { $cond: [{ $eq: ["$verification.idVerified", true] }, 5, 0] },
                            // Photo boost - Small bonus for profiles with photos
                            {
                                $cond: [
                                    { $gt: [{ $size: "$photos" }, 0] },
                                    5, 0
                                ]
                            },
                            // Premium profile boost - Small bonus for premium users
                            { $cond: [{ $eq: ["$isVerified", true] }, 5, 0] }
                        ]
                    }
                }
            },
            // Sort by compatibility score descending
            { $sort: { compatibilityScore: -1 } },
            // Get top 8 matches
            { $limit: 8 }
        ];

        const bestMatches = await Profile.aggregate(matchPipeline);
        const matchIds = bestMatches.map(match => match._id);

        // Get full profile data for top matches
        const premiumMatches = await Profile.find({ _id: { $in: matchIds } })
            .populate('userId', 'email phone role subscription')
            .select('-about.partnerExpectations -about.familyBackground');

        // Sort by compatibility score (already calculated)
        premiumMatches.sort((a, b) => {
            const scoreA = bestMatches.find(m => m._id.toString() === a._id.toString())?.compatibilityScore || 0;
            const scoreB = bestMatches.find(m => m._id.toString() === b._id.toString())?.compatibilityScore || 0;
            return scoreB - scoreA;
        });

        // Apply privacy settings
        const publicMatches = applyPrivacySettings(premiumMatches);

        // Add compatibility scores to output profiles
        const matchesWithScores = publicMatches.map(profile => {
            const matchInfo = bestMatches.find(m => m._id.toString() === profile._id.toString());
            return {
                ...profile,
                compatibilityScore: matchInfo?.compatibilityScore || 0,
                compatibilityPercentage: Math.round((matchInfo?.compatibilityScore || 0) / 91 * 100) // Max score is 91
            };
        });

        res.json({
            premiumMatches: matchesWithScores,
            count: matchesWithScores.length
        });

    } catch (error) {
        console.error('Premium matches error:', error);
        res.status(500).json({ message: 'Failed to get premium matches' });
    }
});

// Save Search
router.post('/save-search', auth, async (req, res) => {
    try {
        const { name, filters } = req.body;

        if (!name || !filters) {
            return res.status(400).json({ message: 'Search name and filters are required' });
        }

        // Find user to update saved searches
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Add new saved search
        const newSearch = {
            name,
            filters,
            notifyNewMatches: req.body.notifyNewMatches || false,
            createdAt: new Date()
        };

        // Check max number of saved searches (limit to 5 for free users)
        if (user.role === 'user' && user.savedSearches && user.savedSearches.length >= 5) {
            return res.status(400).json({ message: 'You can only save up to 5 searches with a free account' });
        }

        user.savedSearches.push(newSearch);
        await user.save();

        res.json({ message: 'Search saved successfully', savedSearch: newSearch });

    } catch (error) {
        console.error('Save search error:', error);
        res.status(500).json({ message: 'Failed to save search' });
    }
});

// Get saved searches
router.get('/saved-searches', auth, async (req, res) => {
    try {
        // Find user with saved searches
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ savedSearches: user.savedSearches || [] });

    } catch (error) {
        console.error('Get saved searches error:', error);
        res.status(500).json({ message: 'Failed to get saved searches' });
    }
});

// Delete saved search
router.delete('/saved-searches/:searchId', auth, async (req, res) => {
    try {
        const { searchId } = req.params;

        // Find user and update
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find index of search to delete
        const searchIndex = user.savedSearches.findIndex(search => search._id.toString() === searchId);
        if (searchIndex === -1) {
            return res.status(404).json({ message: 'Saved search not found' });
        }

        // Remove search from array
        user.savedSearches.splice(searchIndex, 1);
        await user.save();

        res.json({ message: 'Saved search deleted successfully' });

    } catch (error) {
        console.error('Delete saved search error:', error);
        res.status(500).json({ message: 'Failed to delete saved search' });
    }
});

module.exports = router;