import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminUsersPage = () => {
    const queryClient = useQueryClient();
    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-users'],
        queryFn: () => adminAPI.get('/admin/users'),
    });
    const activateMutation = useMutation({
        mutationFn: (userId) => adminAPI.post(`/admin/users/${userId}/activate`),
        onSuccess: () => queryClient.invalidateQueries(['admin-users']),
    });
    const deactivateMutation = useMutation({
        mutationFn: (userId) => adminAPI.post(`/admin/users/${userId}/deactivate`),
        onSuccess: () => queryClient.invalidateQueries(['admin-users']),
    });
    const promoteMutation = useMutation({
        mutationFn: (userId) => adminAPI.post(`/admin/users/${userId}/promote`),
        onSuccess: () => queryClient.invalidateQueries(['admin-users']),
    });
    const demoteMutation = useMutation({
        mutationFn: (userId) => adminAPI.post(`/admin/users/${userId}/demote`),
        onSuccess: () => queryClient.invalidateQueries(['admin-users']),
    });

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="p-8 text-center text-red-600">Failed to load users.</div>;
    const users = data || [];

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Users</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow-sm border border-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left">Email</th>
                            <th className="px-4 py-2 text-left">Phone</th>
                            <th className="px-4 py-2 text-left">Role</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id} className="border-t">
                                <td className="px-4 py-2">{user.email}</td>
                                <td className="px-4 py-2">{user.phone}</td>
                                <td className="px-4 py-2 capitalize">{user.role}</td>
                                <td className="px-4 py-2">{user.isActive ? 'Active' : 'Inactive'}</td>
                                <td className="px-4 py-2 space-x-2">
                                    {user.isActive ? (
                                        <button
                                            onClick={() => deactivateMutation.mutate(user._id)}
                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs font-medium"
                                            disabled={deactivateMutation.isLoading}
                                        >
                                            Deactivate
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => activateMutation.mutate(user._id)}
                                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium"
                                            disabled={activateMutation.isLoading}
                                        >
                                            Activate
                                        </button>
                                    )}
                                    {user.role === 'user' ? (
                                        <button
                                            onClick={() => promoteMutation.mutate(user._id)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium"
                                            disabled={promoteMutation.isLoading}
                                        >
                                            Promote to Admin
                                        </button>
                                    ) : user.role === 'admin' ? (
                                        <button
                                            onClick={() => demoteMutation.mutate(user._id)}
                                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs font-medium"
                                            disabled={demoteMutation.isLoading}
                                        >
                                            Demote to User
                                        </button>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsersPage; 