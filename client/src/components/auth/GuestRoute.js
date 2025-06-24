import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const GuestRoute = () => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    // Allow access to verification page even if authenticated
    const isVerifyRoute = location.pathname === '/verify';

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Allow authenticated users to access verify route
    if (isAuthenticated && !isVerifyRoute) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default GuestRoute; 