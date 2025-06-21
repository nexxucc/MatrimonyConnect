import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interestsAPI } from '../services/api';
import ProfileCard from '../components/profile/ProfileCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const InterestsPage = () => {
    const [tab, setTab] = useState('received');
    const queryClient = useQueryClient();
    const { data, isLoading, error } = useQuery({
        queryKey: ['interests', tab],
        queryFn: () => interestsAPI.get(`/interests/${tab}`),
    });

    const respondMutation = useMutation({
        mutationFn: ({ interestId, action }) => interestsAPI.post(`/interests/respond`, { interestId, action }),
        onSuccess: () => queryClient.invalidateQueries(['interests', tab]),
    });
    const withdrawMutation = useMutation({
        mutationFn: (interestId) => interestsAPI.post(`/interests/withdraw`, { interestId }),
        onSuccess: () => queryClient.invalidateQueries(['interests', tab]),
    });

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="p-8 text-center text-red-600">Failed to load interests.</div>;

    const interests = data || [];

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Interests</h1>
            <div className="flex space-x-4 mb-6">
                <button
                    className={`px-4 py-2 rounded ${tab === 'received' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setTab('received')}
                >
                    Received
                </button>
                <button
                    className={`px-4 py-2 rounded ${tab === 'sent' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setTab('sent')}
                >
                    Sent
                </button>
            </div>
            {interests.length === 0 ? (
                <div className="text-center text-gray-600 py-12">No interests {tab === 'received' ? 'received' : 'sent'}.</div>
            ) : (
                <div className="space-y-6">
                    {interests.map((interest) => (
                        <div key={interest._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
                            <ProfileCard profile={interest.profile} compact />
                            <div className="flex space-x-2">
                                {tab === 'received' ? (
                                    <>
                                        <button
                                            onClick={() => respondMutation.mutate({ interestId: interest._id, action: 'accepted' })}
                                            className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium"
                                            disabled={respondMutation.isLoading}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => respondMutation.mutate({ interestId: interest._id, action: 'rejected' })}
                                            className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium"
                                            disabled={respondMutation.isLoading}
                                        >
                                            Reject
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => withdrawMutation.mutate(interest._id)}
                                        className="px-3 py-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs font-medium"
                                        disabled={withdrawMutation.isLoading}
                                    >
                                        Withdraw
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InterestsPage; 