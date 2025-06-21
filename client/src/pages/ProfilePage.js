import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { profileAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProfileCard from '../components/profile/ProfileCard';

const ProfilePage = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['my-profile'],
        queryFn: () => profileAPI.get('/profiles/me'),
        staleTime: 5 * 60 * 1000,
    });

    const queryClient = useQueryClient();
    const boostMutation = useMutation({
        mutationFn: () => profileAPI.post('/profiles/boost'),
        onSuccess: () => {
            queryClient.invalidateQueries(['my-profile']);
            alert('Profile boosted!');
        },
    });

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="p-8 text-center text-red-600">Failed to load profile.</div>;
    if (!data) return <div className="p-8 text-center">No profile found.</div>;

    const profile = data;

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
            <ProfileCard profile={profile} />
            {profile.boostedUntil && new Date(profile.boostedUntil) > new Date() && (
                <div className="mt-4 text-green-600 font-semibold">Boosted until {new Date(profile.boostedUntil).toLocaleDateString()}</div>
            )}
            {profile.isPremium && (
                <button
                    onClick={() => boostMutation.mutate()}
                    className="inline-flex items-center px-4 py-2 border border-pink-600 text-pink-600 rounded hover:bg-pink-600 hover:text-white text-sm font-medium transition-colors mt-4"
                    disabled={boostMutation.isLoading}
                >
                    {boostMutation.isLoading ? 'Boosting...' : 'Boost My Profile'}
                </button>
            )}
            <div className="mt-6 flex space-x-4">
                <Link
                    to="/profile/edit"
                    className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-600 hover:text-white text-sm font-medium transition-colors"
                >
                    Edit Profile
                </Link>
                <Link
                    to="/subscription"
                    className="inline-flex items-center px-4 py-2 border border-yellow-500 text-yellow-700 rounded hover:bg-yellow-500 hover:text-white text-sm font-medium transition-colors"
                >
                    Manage Subscription
                </Link>
            </div>
        </div>
    );
};

export default ProfilePage; 