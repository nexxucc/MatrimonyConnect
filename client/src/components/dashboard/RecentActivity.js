import React from 'react';
import { Link } from 'react-router-dom';
import {
    HeartIcon,
    EyeIcon,
    ChatBubbleLeftRightIcon,
    UserIcon,
    BellIcon
} from '@heroicons/react/24/outline';

const RecentActivity = ({ activities }) => {
    const getActivityIcon = (type) => {
        switch (type) {
            case 'interest_sent':
                return <HeartIcon className="h-5 w-5 text-red-500" />;
            case 'interest_received':
                return <HeartIcon className="h-5 w-5 text-pink-500" />;
            case 'profile_viewed':
                return <EyeIcon className="h-5 w-5 text-blue-500" />;
            case 'message_sent':
                return <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-500" />;
            case 'profile_updated':
                return <UserIcon className="h-5 w-5 text-purple-500" />;
            default:
                return <BellIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    const getActivityText = (activity) => {
        switch (activity.type) {
            case 'interest_sent':
                return `You sent interest to ${activity.targetName}`;
            case 'interest_received':
                return `${activity.senderName} sent you interest`;
            case 'profile_viewed':
                return `${activity.viewerName} viewed your profile`;
            case 'message_sent':
                return `You sent a message to ${activity.recipientName}`;
            case 'profile_updated':
                return 'You updated your profile';
            default:
                return activity.description || 'Activity occurred';
        }
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return activityTime.toLocaleDateString();
    };

    if (!activities || activities.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Activity
                </h3>
                <div className="text-center py-8">
                    <BellIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No recent activity
                    </h4>
                    <p className="text-gray-600">
                        Start exploring profiles to see your activity here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
            </h3>
            <div className="space-y-4">
                {activities.slice(0, 5).map((activity, index) => (
                    <div key={activity._id || index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                            {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">
                                {getActivityText(activity)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {formatTimeAgo(activity.timestamp)}
                            </p>
                        </div>
                        {activity.profileId && (
                            <Link
                                to={`/profile/${activity.profileId}`}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                View
                            </Link>
                        )}
                    </div>
                ))}
            </div>
            {activities.length > 5 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link
                        to="/activity"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        View all activity
                    </Link>
                </div>
            )}
        </div>
    );
};

export default RecentActivity; 