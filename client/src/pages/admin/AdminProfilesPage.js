import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

const AdminProfilesPage = () => {
    const [filter, setFilter] = useState('pending');
    const queryClient = useQueryClient();
    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-profiles', filter],
        queryFn: () => adminAPI.get('/admin/profiles', { params: { status: filter } }),
    });
    const approveMutation = useMutation({
        mutationFn: (profileId) => adminAPI.post(`/admin/profiles/${profileId}/approve`),
        onSuccess: () => queryClient.invalidateQueries(['admin-profiles', filter]),
    });
    const rejectMutation = useMutation({
        mutationFn: (profileId) => adminAPI.post(`/admin/profiles/${profileId}/reject`),
        onSuccess: () => queryClient.invalidateQueries(['admin-profiles', filter]),
    });
    const verifyMutation = useMutation({
        mutationFn: (profileId) => adminAPI.post(`/admin/profiles/${profileId}/verify`),
        onSuccess: () => queryClient.invalidateQueries(['admin-profiles', filter]),
    });
    const unverifyMutation = useMutation({
        mutationFn: (profileId) => adminAPI.post(`/admin/profiles/${profileId}/unverify`),
        onSuccess: () => queryClient.invalidateQueries(['admin-profiles', filter]),
    });

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="p-8 text-center text-red-600">Failed to load profiles.</div>;
    const profiles = data || [];

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Profiles</h1>
            <div className="flex space-x-4 mb-6">
                <button
                    className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setFilter('pending')}
                >
                    Pending
                </button>
                <button
                    className={`px-4 py-2 rounded ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setFilter('approved')}
                >
                    Approved
                </button>
                <button
                    className={`px-4 py-2 rounded ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                    onClick={() => setFilter('rejected')}
                >
                    Rejected
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow-sm border border-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Age</th>
                            <th className="px-4 py-2 text-left">Religion</th>
                            <th className="px-4 py-2 text-left">Caste</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Verified</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles.map((profile) => (
                            <tr key={profile._id} className="border-t">
                                <td className="px-4 py-2">
                                    <Link to={`/profile/${profile._id}`} className="text-blue-600 hover:underline">{profile.fullName}</Link>
                                </td>
                                <td className="px-4 py-2">{profile.age}</td>
                                <td className="px-4 py-2">{profile.religion}</td>
                                <td className="px-4 py-2">{profile.caste}</td>
                                <td className="px-4 py-2 capitalize">{profile.status}</td>
                                <td className="px-4 py-2">{profile.isVerified ? '✅' : '❌'}</td>
                                <td className="px-4 py-2 space-x-2">
                                    {profile.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => approveMutation.mutate(profile._id)}
                                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium"
                                                disabled={approveMutation.isLoading}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => rejectMutation.mutate(profile._id)}
                                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium"
                                                disabled={rejectMutation.isLoading}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {profile.isVerified ? (
                                        <button
                                            onClick={() => unverifyMutation.mutate(profile._id)}
                                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs font-medium"
                                            disabled={unverifyMutation.isLoading}
                                        >
                                            Unverify
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => verifyMutation.mutate(profile._id)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium"
                                            disabled={verifyMutation.isLoading}
                                        >
                                            Verify
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProfilesPage; 