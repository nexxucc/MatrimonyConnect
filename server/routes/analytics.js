const express = require('express');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Interest = require('../models/Interest');
const Payment = require('../models/Payment');
const Chat = require('../models/Chat');
const Activity = require('../models/Activity');
const SuccessStory = require('../models/SuccessStory');
const { adminAuth, auth } = require('../middleware/auth');

const router = express.Router();

// Get overall platform analytics (admin only)
router.get('/platform', adminAuth, async (req, res) => {
    try {
        const { timeRange = '30days' } = req.query;

        // Calculate date range
        const now = new Date();
        let startDate;

        switch (timeRange) {
            case '7days':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case '30days':
                startDate = new Date(now.setDate(now.getDate() - 30));
                break;
            case '90days':
                startDate = new Date(now.setDate(now.getDate() - 90));
                break;
            case 'year':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                startDate = new Date(now.setDate(now.getDate() - 30));
        }

        // Fetch platform-level analytics
        const [
            totalUsers,
            activeUsers,
            premiumUsers,
            totalProfiles,
            completeProfiles,
            totalInterests,
            acceptedInterests,
            totalPayments,
            revenueData,
            successStoriesCount
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ lastActive: { $gte: startDate } }),
            User.countDocuments({ 'subscription.isActive': true }),
            Profile.countDocuments(),
            Profile.countDocuments({ isProfileComplete: true }),
            Interest.countDocuments(),
            Interest.countDocuments({ status: 'accepted' }),
            Payment.countDocuments({ createdAt: { $gte: startDate } }),
            Payment.aggregate([
                { $match: { createdAt: { $gte: startDate }, paymentStatus: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            SuccessStory.countDocuments({ status: 'approved' })
        ]);

        // Get user growth over time
        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get gender distribution
        const genderDistribution = await Profile.aggregate([
            {
                $group: {
                    _id: '$basicInfo.gender',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get age distribution
        const ageDistribution = await Profile.aggregate([
            {
                $project: {
                    age: {
                        $floor: {
                            $divide: [
                                { $subtract: [new Date(), '$basicInfo.dateOfBirth'] },
                                365 * 24 * 60 * 60 * 1000
                            ]
                        }
                    }
                }
            },
            {
                $bucket: {
                    groupBy: '$age',
                    boundaries: [18, 25, 30, 35, 40, 45, 50, 60, 100],
                    default: 'other',
                    output: {
                        count: { $sum: 1 }
                    }
                }
            }
        ]);

        // Get location distribution (top 10 locations)
        const locationDistribution = await Profile.aggregate([
            {
                $group: {
                    _id: {
                        country: '$location.country',
                        state: '$location.state'
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Get religion distribution
        const religionDistribution = await Profile.aggregate([
            {
                $group: {
                    _id: '$religiousInfo.religion',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get popular search criteria
        const popularSearches = await Activity.aggregate([
            {
                $match: {
                    type: 'search',
                    createdAt: { $gte: startDate }
                }
            },
            { $unwind: '$details.filters' },
            {
                $group: {
                    _id: {
                        filterKey: { $arrayElemAt: [{ $split: ['$details.filters', ':'] }, 0] },
                        filterValue: { $arrayElemAt: [{ $split: ['$details.filters', ':'] }, 1] }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        res.json({
            userStats: {
                total: totalUsers,
                active: activeUsers,
                premium: premiumUsers,
                growth: userGrowth,
                genderDistribution,
                ageDistribution
            },
            profileStats: {
                total: totalProfiles,
                complete: completeProfiles,
                locations: locationDistribution,
                religions: religionDistribution
            },
            activityStats: {
                interests: {
                    total: totalInterests,
                    accepted: acceptedInterests,
                    acceptanceRate: totalInterests > 0 ? (acceptedInterests / totalInterests * 100).toFixed(2) : 0
                },
                payments: {
                    count: totalPayments,
                    revenue: revenueData.length > 0 ? revenueData[0].total : 0
                },
                popularSearches,
                successStories: successStoriesCount
            },
            timeRange
        });

    } catch (error) {
        console.error('Platform analytics error:', error);
        res.status(500).json({ message: 'Failed to retrieve platform analytics' });
    }
});

// Get personal analytics (for logged in users)
router.get('/personal', auth, async (req, res) => {
    try {
        const userId = req.user._id;

        // Calculate date ranges
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

        // Fetch user's profile
        const profile = await Profile.findOne({ userId });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Get profile views
        const profileViews = await Activity.countDocuments({
            type: 'profile_view',
            targetUser: userId,
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Get profile view trend
        const viewTrend = await Activity.aggregate([
            {
                $match: {
                    type: 'profile_view',
                    targetUser: userId,
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get interest stats
        const [
            interestsReceived,
            interestsSent,
            acceptedByYou,
            acceptedByOthers
        ] = await Promise.all([
            Interest.countDocuments({ toUser: userId }),
            Interest.countDocuments({ fromUser: userId }),
            Interest.countDocuments({ toUser: userId, status: 'accepted' }),
            Interest.countDocuments({ fromUser: userId, status: 'accepted' })
        ]);

        // Get chat stats
        const [
            totalChats,
            activeChats,
            messagesSent
        ] = await Promise.all([
            Chat.countDocuments({ participants: userId }),
            Chat.countDocuments({ participants: userId, isActive: true }),
            Chat.aggregate([
                { $match: { participants: userId } },
                { $unwind: '$messages' },
                { $match: { 'messages.sender': userId } },
                { $count: 'total' }
            ])
        ]);

        // Get search appearance stats
        const searchAppearances = await Activity.countDocuments({
            type: 'search_result',
            targetUser: userId,
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Get profile completion percentage
        const profileScore = profile.profileScore || 0;

        // Check if user has a premium subscription
        const isPremium = req.user.subscription && req.user.subscription.isActive;

        res.json({
            profilePerformance: {
                views: profileViews,
                viewTrend,
                searchAppearances,
                completionScore: profileScore,
                isPremium
            },
            interactionStats: {
                interests: {
                    received: interestsReceived,
                    sent: interestsSent,
                    acceptanceRate: interestsSent > 0 ? (acceptedByOthers / interestsSent * 100).toFixed(2) : 0,
                    responseRate: interestsReceived > 0 ? ((acceptedByYou + interestsReceived - (interestsReceived - acceptedByYou)) / interestsReceived * 100).toFixed(2) : 0
                },
                chats: {
                    total: totalChats,
                    active: activeChats,
                    messagesSent: messagesSent.length > 0 ? messagesSent[0].total : 0
                }
            },
            recommendationQuality: {
                matches: acceptedByYou + acceptedByOthers,
                lastUpdated: new Date()
            }
        });
    } catch (error) {
        console.error('Personal analytics error:', error);
        res.status(500).json({ message: 'Failed to retrieve personal analytics' });
    }
});

// Get demographic analytics (admin only)
router.get('/demographics', adminAuth, async (req, res) => {
    try {
        // Age distribution
        const ageDistribution = await Profile.aggregate([
            {
                $project: {
                    age: {
                        $floor: {
                            $divide: [
                                { $subtract: [new Date(), '$basicInfo.dateOfBirth'] },
                                365 * 24 * 60 * 60 * 1000
                            ]
                        }
                    },
                    gender: '$basicInfo.gender'
                }
            },
            {
                $bucket: {
                    groupBy: '$age',
                    boundaries: [18, 25, 30, 35, 40, 45, 50, 60, 100],
                    default: 'other',
                    output: {
                        count: { $sum: 1 },
                        maleCount: {
                            $sum: { $cond: [{ $eq: ['$gender', 'male'] }, 1, 0] }
                        },
                        femaleCount: {
                            $sum: { $cond: [{ $eq: ['$gender', 'female'] }, 1, 0] }
                        }
                    }
                }
            }
        ]);

        // Location distribution
        const locationDistribution = await Profile.aggregate([
            {
                $group: {
                    _id: '$location.country',
                    count: { $sum: 1 },
                    states: {
                        $push: {
                            state: '$location.state',
                            city: '$location.city'
                        }
                    }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        // Religion and caste distribution
        const religionDistribution = await Profile.aggregate([
            {
                $group: {
                    _id: '$religiousInfo.religion',
                    count: { $sum: 1 },
                    castes: {
                        $push: '$religiousInfo.caste'
                    }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Education and profession distribution
        const educationDistribution = await Profile.aggregate([
            {
                $group: {
                    _id: '$education.highestQualification',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        const professionDistribution = await Profile.aggregate([
            {
                $group: {
                    _id: '$career.profession',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        // Income distribution
        const incomeDistribution = await Profile.aggregate([
            {
                $group: {
                    _id: '$career.income',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            ageDistribution,
            locationDistribution,
            religionDistribution,
            educationDistribution,
            professionDistribution,
            incomeDistribution
        });

    } catch (error) {
        console.error('Demographics analytics error:', error);
        res.status(500).json({ message: 'Failed to retrieve demographic analytics' });
    }
});

// Get behavior analytics (admin only)
router.get('/behavior', adminAuth, async (req, res) => {
    try {
        const { timeRange = '30days' } = req.query;

        // Calculate date range
        const now = new Date();
        let startDate;

        switch (timeRange) {
            case '7days':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case '30days':
                startDate = new Date(now.setDate(now.getDate() - 30));
                break;
            case '90days':
                startDate = new Date(now.setDate(now.getDate() - 90));
                break;
            default:
                startDate = new Date(now.setDate(now.getDate() - 30));
        }

        // Get activity distribution by type
        const activityDistribution = await Activity.aggregate([
            {
                $match: { createdAt: { $gte: startDate } }
            },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get peak usage times
        const peakUsageTimes = await Activity.aggregate([
            {
                $match: { createdAt: { $gte: startDate } }
            },
            {
                $project: {
                    hour: { $hour: '$createdAt' },
                    dayOfWeek: { $dayOfWeek: '$createdAt' }
                }
            },
            {
                $group: {
                    _id: {
                        hour: '$hour',
                        dayOfWeek: '$dayOfWeek'
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Get user retention data
        const retentionData = await User.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $lookup: {
                    from: 'activities',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$user', '$$userId'] },
                                createdAt: { $gte: startDate }
                            }
                        }
                    ],
                    as: 'activities'
                }
            },
            {
                $project: {
                    _id: 1,
                    createdAt: 1,
                    activityCount: { $size: '$activities' },
                    hasReturnedAfter1Day: {
                        $gt: [
                            {
                                $size: {
                                    $filter: {
                                        input: '$activities',
                                        as: 'activity',
                                        cond: {
                                            $gte: [
                                                { $subtract: ['$$activity.createdAt', '$createdAt'] },
                                                24 * 60 * 60 * 1000
                                            ]
                                        }
                                    }
                                }
                            },
                            0
                        ]
                    },
                    hasReturnedAfter7Days: {
                        $gt: [
                            {
                                $size: {
                                    $filter: {
                                        input: '$activities',
                                        as: 'activity',
                                        cond: {
                                            $gte: [
                                                { $subtract: ['$$activity.createdAt', '$createdAt'] },
                                                7 * 24 * 60 * 60 * 1000
                                            ]
                                        }
                                    }
                                }
                            },
                            0
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    usersReturnedAfter1Day: { $sum: { $cond: ['$hasReturnedAfter1Day', 1, 0] } },
                    usersReturnedAfter7Days: { $sum: { $cond: ['$hasReturnedAfter7Days', 1, 0] } }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalUsers: 1,
                    retention1Day: {
                        $multiply: [
                            { $divide: ['$usersReturnedAfter1Day', '$totalUsers'] },
                            100
                        ]
                    },
                    retention7Days: {
                        $multiply: [
                            { $divide: ['$usersReturnedAfter7Days', '$totalUsers'] },
                            100
                        ]
                    }
                }
            }
        ]);

        // Get feature usage stats
        const featureUsage = await Activity.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    type: {
                        $in: [
                            'search',
                            'profile_view',
                            'interest_sent',
                            'chat_message',
                            'profile_update',
                            'photo_upload'
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$user' }
                }
            },
            {
                $project: {
                    _id: 1,
                    count: 1,
                    uniqueUsers: { $size: '$uniqueUsers' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            activityDistribution,
            peakUsageTimes,
            retention: retentionData.length > 0 ? retentionData[0] : null,
            featureUsage,
            timeRange
        });

    } catch (error) {
        console.error('Behavior analytics error:', error);
        res.status(500).json({ message: 'Failed to retrieve behavior analytics' });
    }
});

// Get matching analytics (admin only)
router.get('/matching', adminAuth, async (req, res) => {
    try {
        // Get interest success rate by various demographics
        const interestSuccessByAge = await Interest.aggregate([
            {
                $lookup: {
                    from: 'profiles',
                    localField: 'fromUser',
                    foreignField: 'userId',
                    as: 'senderProfile'
                }
            },
            { $unwind: '$senderProfile' },
            {
                $project: {
                    status: 1,
                    age: {
                        $floor: {
                            $divide: [
                                { $subtract: [new Date(), '$senderProfile.basicInfo.dateOfBirth'] },
                                365 * 24 * 60 * 60 * 1000
                            ]
                        }
                    }
                }
            },
            {
                $bucket: {
                    groupBy: '$age',
                    boundaries: [18, 25, 30, 35, 40, 45, 50, 60, 100],
                    default: 'other',
                    output: {
                        total: { $sum: 1 },
                        accepted: {
                            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
                        }
                    }
                }
            },
            {
                $project: {
                    ageRange: '$_id',
                    total: 1,
                    accepted: 1,
                    acceptanceRate: {
                        $multiply: [
                            { $divide: ['$accepted', '$total'] },
                            100
                        ]
                    }
                }
            }
        ]);

        // Get interest success rate by religion
        const interestSuccessByReligion = await Interest.aggregate([
            {
                $lookup: {
                    from: 'profiles',
                    localField: 'fromUser',
                    foreignField: 'userId',
                    as: 'senderProfile'
                }
            },
            { $unwind: '$senderProfile' },
            {
                $group: {
                    _id: '$senderProfile.religiousInfo.religion',
                    total: { $sum: 1 },
                    accepted: {
                        $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    religion: '$_id',
                    total: 1,
                    accepted: 1,
                    acceptanceRate: {
                        $multiply: [
                            { $divide: ['$accepted', '$total'] },
                            100
                        ]
                    }
                }
            },
            { $sort: { total: -1 } }
        ]);

        // Get preferred attributes in matching
        const preferredAttributes = await Interest.aggregate([
            {
                $match: { status: 'accepted' }
            },
            {
                $lookup: {
                    from: 'profiles',
                    localField: 'toUser',
                    foreignField: 'userId',
                    as: 'recipientProfile'
                }
            },
            { $unwind: '$recipientProfile' },
            {
                $group: {
                    _id: null,
                    educationCounts: {
                        $push: '$recipientProfile.education.highestQualification'
                    },
                    professionCounts: {
                        $push: '$recipientProfile.career.profession'
                    },
                    heightCounts: {
                        $push: '$recipientProfile.basicInfo.height'
                    },
                    incomeCounts: {
                        $push: '$recipientProfile.career.income'
                    }
                }
            },
            {
                $project: {
                    educationCounts: {
                        $filter: {
                            input: '$educationCounts',
                            as: 'item',
                            cond: { $ne: ['$$item', null] }
                        }
                    },
                    professionCounts: {
                        $filter: {
                            input: '$professionCounts',
                            as: 'item',
                            cond: { $ne: ['$$item', null] }
                        }
                    },
                    heightCounts: {
                        $filter: {
                            input: '$heightCounts',
                            as: 'item',
                            cond: { $ne: ['$$item', null] }
                        }
                    },
                    incomeCounts: {
                        $filter: {
                            input: '$incomeCounts',
                            as: 'item',
                            cond: { $ne: ['$$item', null] }
                        }
                    }
                }
            }
        ]);

        // Get match rate by profile completeness
        const matchRateByCompleteness = await Interest.aggregate([
            {
                $lookup: {
                    from: 'profiles',
                    localField: 'fromUser',
                    foreignField: 'userId',
                    as: 'senderProfile'
                }
            },
            { $unwind: '$senderProfile' },
            {
                $bucket: {
                    groupBy: '$senderProfile.profileScore',
                    boundaries: [0, 20, 40, 60, 80, 100],
                    default: 'other',
                    output: {
                        total: { $sum: 1 },
                        accepted: {
                            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
                        }
                    }
                }
            },
            {
                $project: {
                    scoreRange: '$_id',
                    total: 1,
                    accepted: 1,
                    acceptanceRate: {
                        $cond: [
                            { $eq: ['$total', 0] },
                            0,
                            {
                                $multiply: [
                                    { $divide: ['$accepted', '$total'] },
                                    100
                                ]
                            }
                        ]
                    }
                }
            }
        ]);

        res.json({
            interestSuccessByAge,
            interestSuccessByReligion,
            preferredAttributes: preferredAttributes.length > 0 ? preferredAttributes[0] : null,
            matchRateByCompleteness
        });

    } catch (error) {
        console.error('Matching analytics error:', error);
        res.status(500).json({ message: 'Failed to retrieve matching analytics' });
    }
});

module.exports = router;
