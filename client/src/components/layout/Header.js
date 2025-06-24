import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, User, LogOut, Settings, Heart, Search, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PropTypes from 'prop-types';

const Header = ({ onMenuClick }) => {
    const { user, logout, isPremium } = useAuth();
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    return (
        <header className="bg-white shadow-md border-b border-pink-100 lg:pl-64 fixed top-0 right-0 left-0 z-30">
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
                {/* Mobile menu button */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-full text-pink-500 hover:text-pink-600 hover:bg-pink-50"
                >
                    <Menu className="h-6 w-6" />
                </button>

                {/* Logo for mobile (can be hidden on desktop if sidebar has logo) */}
                <div className="lg:hidden flex items-center">
                    <span className="font-bold text-xl text-pink-600">Matrimony<span className="text-rose-600">Connect</span></span>
                </div>

                {/* Search bar - styled for matrimonial site */}
                <div className="flex-1 max-w-lg mx-4 hidden md:flex items-center">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-pink-400" />
                        </div>
                        <input
                            type="search"
                            placeholder="Search profiles..."
                            className="block w-full pl-10 pr-3 py-2 border border-pink-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center space-x-3">
                    {/* Quick action buttons */}
                    <Link to="/matches" className="p-2 text-pink-500 hover:text-pink-600 hover:bg-pink-50 rounded-full hidden sm:block" title="Matches">
                        <Heart className="h-5 w-5" />
                    </Link>

                    <Link to="/chat" className="p-2 text-pink-500 hover:text-pink-600 hover:bg-pink-50 rounded-full relative hidden sm:block" title="Messages">
                        <MessageCircle className="h-5 w-5" />
                        <span className="absolute top-1 right-1 h-2 w-2 bg-green-500 rounded-full"></span>
                    </Link>

                    {/* Notifications */}
                    <button className="p-2 text-pink-500 hover:text-pink-600 hover:bg-pink-50 rounded-full relative" title="Notifications">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* Premium badge */}
                    {isPremium() && (
                        <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-sm">
                            Premium
                        </span>
                    )}

                    {/* User menu */}
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center space-x-2 p-1.5 rounded-full text-gray-600 hover:text-pink-600 hover:bg-pink-50 border border-transparent hover:border-pink-200"
                        >
                            <div className="h-8 w-8 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center shadow-sm">
                                <span className="text-white text-sm font-medium">
                                    {user?.email?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <span className="hidden sm:block text-sm font-medium text-gray-700 mr-1">
                                {user?.name || user?.email?.split('@')[0]}
                            </span>
                        </button>

                        {/* User dropdown - matrimony themed */}
                        {userMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-50 border border-pink-100">
                                <div className="px-4 py-3 border-b border-pink-50">
                                    <p className="text-sm text-gray-500">Signed in as</p>
                                    <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                                </div>

                                <Link
                                    to="/profile"
                                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50"
                                    onClick={() => setUserMenuOpen(false)}
                                >
                                    <User className="h-4 w-4 mr-3 text-pink-500" />
                                    My Profile
                                </Link>

                                <Link
                                    to="/settings"
                                    className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50"
                                    onClick={() => setUserMenuOpen(false)}
                                >
                                    <Settings className="h-4 w-4 mr-3 text-pink-500" />
                                    Account Settings
                                </Link>

                                {!isPremium() && (
                                    <Link
                                        to="/subscription"
                                        className="flex items-center px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50"
                                        onClick={() => setUserMenuOpen(false)}
                                    >
                                        <svg className="h-4 w-4 mr-3" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        Upgrade to Premium
                                    </Link>
                                )}

                                <hr className="my-1 border-pink-50" />
                                <button
                                    onClick={() => {
                                        logout();
                                        setUserMenuOpen(false);
                                    }}
                                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50"
                                >
                                    <LogOut className="h-4 w-4 mr-3 text-pink-500" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Close user menu when clicking outside */}
            {userMenuOpen && (<button
                className="fixed inset-0 z-40 bg-transparent border-0"
                onClick={() => setUserMenuOpen(false)}
                onKeyDown={(e) => { if (e.key === 'Escape') setUserMenuOpen(false) }}
                aria-label="Close menu"
            />
            )}
        </header>
    );
};

Header.propTypes = {
    onMenuClick: PropTypes.func
};

export default Header;