import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { UserGroupIcon, IdentificationIcon, CurrencyRupeeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import AdminPaymentsPage from './AdminPaymentsPage';
import AdminReportsPage from './AdminReportsPage';

const statIcons = {
    users: UserGroupIcon,
    profiles: IdentificationIcon,
    payments: CurrencyRupeeIcon,
    reports: ExclamationTriangleIcon,
};

const AdminDashboardPage = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: () => adminAPI.get('/admin/dashboard'),
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="p-8 text-center text-red-600">Failed to load admin dashboard.</div>;

    const stats = [
        {
            label: 'Total Users',
            value: data?.users || 0,
            icon: statIcons.users,
            link: '/admin/users',
        },
        {
            label: 'Profiles',
            value: data?.profiles || 0,
            icon: statIcons.profiles,
            link: '/admin/profiles',
        },
        {
            label: 'Payments',
            value: data?.payments || 0,
            icon: statIcons.payments,
            link: '/admin/payments',
        },
        {
            label: 'Reports',
            value: data?.reports || 0,
            icon: statIcons.reports,
            link: '/admin/reports',
        },
    ];

    // Example analytics data (replace with real data from backend)
    const analytics = data?.analytics || {
        userGrowth: [
            { month: 'Jan', users: 100 },
            { month: 'Feb', users: 150 },
            { month: 'Mar', users: 200 },
        ],
        payments: [
            { month: 'Jan', amount: 5000 },
            { month: 'Feb', amount: 8000 },
            { month: 'Mar', amount: 12000 },
        ],
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                    <Link to={stat.link} key={stat.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col items-center hover:shadow-md transition-shadow">
                        <stat.icon className="h-8 w-8 text-blue-600 mb-2" />
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-gray-600 mt-1">{stat.label}</div>
                    </Link>
                ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/admin/users" className="block bg-blue-50 border border-blue-200 rounded-lg p-6 text-blue-800 font-semibold hover:bg-blue-100 transition">Manage Users</Link>
                <Link to="/admin/profiles" className="block bg-green-50 border border-green-200 rounded-lg p-6 text-green-800 font-semibold hover:bg-green-100 transition">Manage Profiles</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Link to="/admin/payments" className="block bg-orange-50 border border-orange-200 rounded-lg p-6 text-orange-800 font-semibold hover:bg-orange-100 transition">Manage Payments</Link>
                <Link to="/admin/reports" className="block bg-red-50 border border-red-200 rounded-lg p-6 text-red-800 font-semibold hover:bg-red-100 transition">Manage Reports</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">User Growth</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={analytics.userGrowth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4">Payments</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={analytics.payments}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="amount" fill="#f59e42" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage; 