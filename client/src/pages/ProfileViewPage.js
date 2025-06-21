import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProfileCard from '../components/profile/ProfileCard';

const ProfileViewPage = () => {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const { data, isLoading, error } = useQuery({
        queryKey: ['profile', id],
        queryFn: () => profileAPI.get(`/profiles/${id}`),
    });

    const interestMutation = useMutation({
        mutationFn: () => profileAPI.post(`/interests/send`, { profileId: id }),
        onSuccess: () => {
            queryClient.invalidateQueries(['profile', id]);
            alert('Interest sent!');
        },
    });

    const blockMutation = useMutation({
        mutationFn: () => profileAPI.post(`/profiles/block/${data?.userId}`),
        onSuccess: () => alert('User blocked!'),
    });

    const reportMutation = useMutation({
        mutationFn: (reason) => profileAPI.post(`/profiles/report/${data?._id}`, { reason }),
        onSuccess: () => alert('User reported!'),
    });

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="p-8 text-center text-red-600">Profile not found.</div>;
    if (!data) return <div className="p-8 text-center">No profile found.</div>;

    const profile = data;

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <ProfileCard profile={profile} />
            <div className="mt-6 flex space-x-4">
                <button
                    onClick={() => interestMutation.mutate()}
                    className="inline-flex items-center px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-600 hover:text-white text-sm font-medium transition-colors"
                    disabled={interestMutation.isLoading}
                >
                    {interestMutation.isLoading ? 'Sending...' : 'Send Interest'}
                </button>
                {profile.isPremium && (
                    <Link
                        to={`/chat?user=${profile.userId}`}
                        className="inline-flex items-center px-4 py-2 border border-purple-600 text-purple-600 rounded hover:bg-purple-600 hover:text-white text-sm font-medium transition-colors"
                    >
                        Message
                    </Link>
                )}
                <button
                    onClick={() => blockMutation.mutate()}
                    className="inline-flex items-center px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium transition-colors"
                >
                    Block User
                </button>
                <button
                    onClick={() => {
                        const reason = prompt('Please enter a reason for reporting this user:');
                        if (reason) reportMutation.mutate(reason);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-red-400 text-red-600 rounded hover:bg-red-100 text-sm font-medium transition-colors"
                >
                    Report User
                </button>
            </div>
        </div>
    );
};

export default ProfileViewPage; 