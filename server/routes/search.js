const express = require('express');
const Profile = require('../models/Profile');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Search Profiles
router.get('/', auth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            gender,
            ageMin,
            ageMax,
            religion,
            caste,
            location,
            education,
            profession,
            income,
            maritalStatus,
            sortBy = 'lastActive',
            sortOrder = 'desc'
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
            isProfileComplete: true
        };

        // Gender filter (opposite gender)
        if (userProfile.basicInfo.gender) {
            query['basicInfo.gender'] = userProfile.basicInfo.gender === 'male' ? 'female' : 'male';
        }

        // Age filter
        if (ageMin || ageMax) {
            const today = new Date();
            const minDate = ageMax ? new Date(today.getFullYear() - ageMax - 1, today.getMonth(), today.getDate()) : null;
            const maxDate = ageMin ? new Date(today.getFullYear() - ageMin, today.getMonth(), today.getDate()) : null;

            if (minDate && maxDate) {
                query['basicInfo.dateOfBirth'] = { $gte: minDate, $lte: maxDate };
            } else if (minDate) {
                query['basicInfo.dateOfBirth'] = { $gte: minDate };
            } else if (maxDate) {
                query['basicInfo.dateOfBirth'] = { $lte: maxDate };
            }
        }

        // Religion filter
        if (religion) {
            query['religiousInfo.religion'] = { $in: religion.split(',') };
        }

        // Caste filter
        if (caste) {
            query['religiousInfo.caste'] = { $in: caste.split(',') };
        }

        // Location filter
        if (location) {
            const locationRegex = new RegExp(location, 'i');
            query['$or'] = [
                { 'location.city': locationRegex },
                { 'location.state': locationRegex },
                { 'location.country': locationRegex }
            ];
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

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute search
        const skip = (page - 1) * limit;
        const profiles = await Profile.find(query)
            .populate('userId', 'email phone role subscription')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-about.partnerExpectations -about.familyBackground');

        // Get total count
        const total = await Profile.countDocuments(query);

        // Apply privacy settings to results
        const publicProfiles = profiles.map(profile => {
            const publicProfile = { ...profile.toObject() };

            // Hide sensitive information
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
        });

        res.json({
            profiles: publicProfiles,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalResults: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Search failed' });
    }
});

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
            isProfileComplete: true
        };

        // Gender filter
        if (userProfile.basicInfo.gender) {
            query['basicInfo.gender'] = userProfile.basicInfo.gender === 'male' ? 'female' : 'male';
        }

        // Age range from preferences
        if (userProfile.preferences.ageRange) {
            const today = new Date();
            const minDate = new Date(today.getFullYear() - userProfile.preferences.ageRange.max - 1, today.getMonth(), today.getDate());
            const maxDate = new Date(today.getFullYear() - userProfile.preferences.ageRange.min, today.getMonth(), today.getDate());
            query['basicInfo.dateOfBirth'] = { $gte: minDate, $lte: maxDate };
        }

        // Religion from preferences
        if (userProfile.preferences.religions && userProfile.preferences.religions.length > 0) {
            query['religiousInfo.religion'] = { $in: userProfile.preferences.religions };
        }

        // Caste from preferences
        if (userProfile.preferences.castes && userProfile.preferences.castes.length > 0) {
            query['religiousInfo.caste'] = { $in: userProfile.preferences.castes };
        }

        // Location from preferences
        if (userProfile.preferences.locations && userProfile.preferences.locations.length > 0) {
            query['$or'] = userProfile.preferences.locations.map(location => ({
                'location.city': new RegExp(location, 'i')
            }));
        }

        // Get 10 daily matches
        const matches = await Profile.find(query)
            .populate('userId', 'email phone role subscription')
            .sort({ lastActive: -1, profileScore: -1 })
            .limit(10)
            .select('-about.partnerExpectations -about.familyBackground');

        // Apply privacy settings
        const publicMatches = matches.map(profile => {
            const publicProfile = { ...profile.toObject() };

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
        });

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
            isProfileComplete: true
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

        // Get similar profiles
        const similarProfiles = await Profile.find(query)
            .populate('userId', 'email phone role subscription')
            .sort({ profileScore: -1 })
            .limit(5)
            .select('-about.partnerExpectations -about.familyBackground');

        // Apply privacy settings
        const publicProfiles = similarProfiles.map(profile => {
            const publicProfile = { ...profile.toObject() };

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
        });

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
        const cities = await Profile.distinct('location.city');
        const states = await Profile.distinct('location.state');
        const countries = await Profile.distinct('location.country');
        const educations = await Profile.distinct('education.highestQualification');
        const professions = await Profile.distinct('career.profession');
        const incomes = await Profile.distinct('career.income');
        const maritalStatuses = await Profile.distinct('basicInfo.maritalStatus');

        res.json({
            filters: {
                religions: religions.filter(Boolean),
                castes: castes.filter(Boolean),
                cities: cities.filter(Boolean),
                states: states.filter(Boolean),
                countries: countries.filter(Boolean),
                educations: educations.filter(Boolean),
                professions: professions.filter(Boolean),
                incomes: incomes.filter(Boolean),
                maritalStatuses: maritalStatuses.filter(Boolean)
            }
        });

    } catch (error) {
        console.error('Get filters error:', error);
        res.status(500).json({ message: 'Failed to get filters' });
    }
});

module.exports = router; 