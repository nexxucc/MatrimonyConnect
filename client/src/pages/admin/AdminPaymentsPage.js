import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminPaymentsPage = () => {
    const queryClient = useQueryClient();
    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-payments'],
        queryFn: () => adminAPI.get('/admin/payments'),
    });
    const refundMutation = useMutation({
        mutationFn: (id) => adminAPI.post(`/admin/payments/${id}/refund`),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-payments']);
            alert('Refund processed!');
        },
    });
    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="p-8 text-center text-red-600">Failed to load payments.</div>;
    const payments = data?.payments || [];
    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Payments</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow-sm border border-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left">User</th>
                            <th className="px-4 py-2 text-left">Amount</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((p) => (
                            <tr key={p._id} className="border-t">
                                <td className="px-4 py-2">{p.user?.email}</td>
                                <td className="px-4 py-2">₹{p.amount / 100}</td>
                                <td className="px-4 py-2">{p.status}</td>
                                <td className="px-4 py-2">{new Date(p.createdAt).toLocaleString()}</td>
                                <td className="px-4 py-2">
                                    <button
                                        onClick={() => refundMutation.mutate(p._id)}
                                        className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-xs font-medium"
                                        disabled={refundMutation.isLoading}
                                    >
                                        Refund
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPaymentsPage; 