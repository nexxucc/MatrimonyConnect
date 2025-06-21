import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminReportsPage = () => {
    const queryClient = useQueryClient();
    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-reports'],
        queryFn: () => adminAPI.get('/admin/reports'),
    });
    const resolveMutation = useMutation({
        mutationFn: ({ profileId, reportIdx }) => adminAPI.post(`/admin/reports/${profileId}/${reportIdx}/resolve`),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-reports']);
            alert('Report resolved!');
        },
    });
    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="p-8 text-center text-red-600">Failed to load reports.</div>;
    const profiles = data?.profiles || [];
    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Reports</h1>
            {profiles.length === 0 ? (
                <div className="text-gray-600">No reports found.</div>
            ) : (
                <div className="space-y-8">
                    {profiles.map((profile) => (
                        <div key={profile._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="font-semibold text-lg text-gray-900 mb-2">{profile.fullName || profile._id}</div>
                            <div className="space-y-4">
                                {profile.reports.map((report, idx) => (
                                    <div key={idx} className="border-b pb-2 mb-2">
                                        <div className="text-gray-700"><span className="font-medium">Reporter:</span> {report.reporter?.email || report.reporter}</div>
                                        <div className="text-gray-700"><span className="font-medium">Reason:</span> {report.reason}</div>
                                        <div className="text-gray-700"><span className="font-medium">Details:</span> {report.details}</div>
                                        <div className="text-gray-500 text-xs">{new Date(report.createdAt).toLocaleString()}</div>
                                        <button
                                            onClick={() => resolveMutation.mutate({ profileId: profile._id, reportIdx: idx })}
                                            className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium"
                                            disabled={resolveMutation.isLoading}
                                        >
                                            Resolve
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminReportsPage; 