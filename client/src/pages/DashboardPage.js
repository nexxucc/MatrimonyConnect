import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    HeartIcon,
    UserGroupIcon,
    ChatBubbleLeftRightIcon,
    BellIcon,
    EyeIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import { userAPI, profileAPI, searchAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProfileCard from '../components/profile/ProfileCard';
import StatsCard from '../components/dashboard/StatsCard';
import RecentActivity from '../components/dashboard/RecentActivity';

const DashboardPage = () => {
    const [activeTab, setActiveTab] = useState('matches');

    // Fetch dashboard data
    const { data: dashboardData, isLoading, error } = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => profileAPI.getProfile(), // Changed from userAPI.get('/profiles/dashboard')
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch daily matches
    const { data: dailyMatches } = useQuery({
        queryKey: ['daily-matches'],
        queryFn: () => searchAPI.getDailyMatches(), // Changed from userAPI.get('/search/daily-matches')
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    // Fetch user activity log
    const { data: activityLog, isLoading: loadingActivity } = useQuery({
        queryKey: ['activity-log'],
        queryFn: () => userAPI.getActivityLogs(), // Changed from userAPI.get('/users/activity-logs')
        staleTime: 2 * 60 * 1000,
    });

    if (isLoading) return <LoadingSpinner />;
    // Handle 404 for missing profile
    if (error && error.response?.status === 404) {
        console.log('404 error:', error);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Complete Your Profile</h2>
                    <p className="text-gray-600 mb-4">You need to complete your profile to access the dashboard and matches.</p>
                    <Link
                        to="/profile/edit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Complete Profile
                    </Link>
                </div>
            </div>
        );
    }
    if (error) {
        console.log('Other error:', error);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
                    <p className="text-gray-600 mb-4">{error.message}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const stats = [
        {
            title: 'Profile Views',
            value: dashboardData?.stats?.profileViews || 0,
            icon: EyeIcon,
            color: 'bg-blue-500',
            change: '+12%',
            changeType: 'positive'
        },
        {
            title: 'Interests Received',
            value: dashboardData?.stats?.interestsReceived || 0,
            icon: HeartIcon,
            color: 'bg-red-500',
            change: '+5%',
            changeType: 'positive'
        },
        {
            title: 'Interests Sent',
            value: dashboardData?.stats?.interestsSent || 0,
            icon: UserGroupIcon,
            color: 'bg-green-500',
            change: '+8%',
            changeType: 'positive'
        },
        {
            title: 'Chat Messages',
            value: dashboardData?.stats?.chatMessages || 0,
            icon: ChatBubbleLeftRightIcon,
            color: 'bg-purple-500',
            change: '+15%',
            changeType: 'positive'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {dashboardData?.user?.firstName || 'User'}!
                    </h1>
                    <p className="text-gray-600">
                        Here's what's happening with your profile today
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <StatsCard {...stat} />
                        </motion.div>
                    ))}
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Daily Matches */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Daily Matches
                                    </h2>
                                    <Link
                                        to="/search"
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        View All
                                    </Link>
                                </div>
                            </div>
                            <div className="p-6">
                                {dailyMatches?.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {dailyMatches.slice(0, 4).map((match) => (
                                            <ProfileCard key={match._id} profile={match} compact />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <HeartIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            No matches today
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Check back tomorrow for new matches or update your preferences.
                                        </p>
                                        <Link
                                            to="/profile/edit"
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                        >
                                            Update Preferences
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Activity Log Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-8">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">My Activity Log</h2>
                            </div>
                            <div className="p-6">
                                {loadingActivity ? <LoadingSpinner /> : (
                                    <ul className="space-y-2">
                                        {activityLog?.logs?.length > 0 ? activityLog.logs.map((log) => (
                                            <li key={log._id} className="text-gray-700 text-sm border-b last:border-b-0 py-2">
                                                <span className="font-medium text-gray-900">{log.type.replace('_', ' ').toUpperCase()}</span>: {log.description} <span className="text-xs text-gray-400">({new Date(log.createdAt).toLocaleString()})</span>
                                            </li>
                                        )) : <li className="text-gray-500">No recent activity.</li>}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Quick Actions
                            </h3>
                            <div className="space-y-3">
                                <Link
                                    to="/profile/edit"
                                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                >
                                    <UserGroupIcon className="h-5 w-5 text-blue-600 mr-3" />
                                    <span className="text-sm font-medium text-gray-900">
                                        Edit Profile
                                    </span>
                                </Link>
                                <Link
                                    to="/search"
                                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
                                >
                                    <EyeIcon className="h-5 w-5 text-green-600 mr-3" />
                                    <span className="text-sm font-medium text-gray-900">
                                        Browse Profiles
                                    </span>
                                </Link>
                                <Link
                                    to="/interests"
                                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors"
                                >
                                    <HeartIcon className="h-5 w-5 text-red-600 mr-3" />
                                    <span className="text-sm font-medium text-gray-900">
                                        View Interests
                                    </span>
                                </Link>
                                <Link
                                    to="/chat"
                                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                                >
                                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-600 mr-3" />
                                    <span className="text-sm font-medium text-gray-900">
                                        Messages
                                    </span>
                                </Link>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <RecentActivity activities={dashboardData?.recentActivity || []} />

                        {/* Profile Completion */}
                        {dashboardData?.profileCompletion && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Profile Completion
                                </h3>
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Completion</span>
                                        <span className="font-medium text-gray-900">
                                            {dashboardData.profileCompletion.percentage}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${dashboardData.profileCompletion.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                                {dashboardData.profileCompletion.missingFields?.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Missing information:</p>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            {dashboardData.profileCompletion.missingFields.slice(0, 3).map((field) => (
                                                <li key={field} className="flex items-center">
                                                    <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                                                    {field}
                                                </li>
                                            ))}
                                        </ul>
                                        {dashboardData.profileCompletion.missingFields.length > 3 && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                +{dashboardData.profileCompletion.missingFields.length - 3} more
                                            </p>
                                        )}
                                    </div>
                                )}
                                <Link
                                    to="/profile/edit"
                                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 w-full justify-center"
                                >
                                    Complete Profile
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;