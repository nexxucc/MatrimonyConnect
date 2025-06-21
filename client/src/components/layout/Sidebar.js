import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Home, User, Search, Heart, MessageCircle, CreditCard, Users, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ open, onClose }) => {
    const location = useLocation();
    const { isAdmin } = useAuth();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'My Profile', href: '/profile', icon: User },
        { name: 'Search', href: '/search', icon: Search },
        { name: 'Interests', href: '/interests', icon: Heart },
        { name: 'Chat', href: '/chat', icon: MessageCircle },
        { name: 'Subscription', href: '/subscription', icon: CreditCard },
    ];

    const adminNavigation = [
        { name: 'Admin Dashboard', href: '/admin', icon: Shield },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Profiles', href: '/admin/profiles', icon: User },
    ];

    const isActive = (href) => location.pathname === href;

    return (
        <>
            {/* Desktop sidebar */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
                        {/* Logo */}
                        <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gradient-to-r from-pink-600 to-purple-600">
                            <Link to="/" className="flex items-center">
                                <span className="text-white text-xl font-bold">Matrimony Connect</span>
                            </Link>
                        </div>

                        {/* Navigation */}
                        <div className="flex-1 flex flex-col overflow-y-auto">
                            <nav className="flex-1 px-2 py-4 space-y-1">
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.href)
                                                    ? 'bg-pink-100 text-pink-700'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <Icon className="mr-3 h-5 w-5" />
                                            {item.name}
                                        </Link>
                                    );
                                })}

                                {/* Admin section */}
                                {isAdmin() && (
                                    <>
                                        <div className="pt-4 pb-2">
                                            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Admin
                                            </h3>
                                        </div>
                                        {adminNavigation.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <Link
                                                    key={item.name}
                                                    to={item.href}
                                                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.href)
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                        }`}
                                                >
                                                    <Icon className="mr-3 h-5 w-5" />
                                                    {item.name}
                                                </Link>
                                            );
                                        })}
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile sidebar */}
            <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-pink-600 to-purple-600">
                        <Link to="/" className="flex items-center">
                            <span className="text-white text-xl font-bold">Matrimony Connect</span>
                        </Link>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 flex flex-col overflow-y-auto">
                        <nav className="flex-1 px-2 py-4 space-y-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={onClose}
                                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.href)
                                                ? 'bg-pink-100 text-pink-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className="mr-3 h-5 w-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}

                            {/* Admin section */}
                            {isAdmin() && (
                                <>
                                    <div className="pt-4 pb-2">
                                        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Admin
                                        </h3>
                                    </div>
                                    {adminNavigation.map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                onClick={onClose}
                                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.href)
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                    }`}
                                            >
                                                <Icon className="mr-3 h-5 w-5" />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar; 