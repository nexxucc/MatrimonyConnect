import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, StarIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarSolid, StarIcon as StarOutline } from '@heroicons/react/24/solid';

const ProfileCard = ({ profile, compact, onFavorite, onUnfavorite, isFavorite }) => {
    if (!profile) return null;
    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex ${compact ? 'items-center space-x-4' : 'flex-col'} hover:shadow-md transition-shadow`}>
            <Link to={`/profile/${profile._id}`} className="flex-shrink-0">
                <img
                    src={profile.photoUrl || '/default-profile.png'}
                    alt={profile.fullName}
                    className={`rounded-full object-cover ${compact ? 'h-16 w-16' : 'h-32 w-32 mx-auto'} border-2 border-blue-100`}
                />
            </Link>
            <div className={compact ? 'flex-1 min-w-0' : 'mt-4 text-center'}>
                <Link to={`/profile/${profile._id}`} className="block font-semibold text-gray-900 text-lg hover:text-blue-600">
                    {profile.fullName}
                    {profile.isVerified && (
                        <CheckBadgeIcon className="inline h-5 w-5 text-blue-500 ml-1 align-middle" title="Verified" />
                    )}
                </Link>
                <div className={`text-gray-600 ${compact ? 'text-sm' : 'text-base'} mt-1`}>{profile.age} yrs, {profile.religion}, {profile.caste}</div>
                <div className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'} mt-1`}>{profile.city}, {profile.state}</div>
                {profile.isPremium && (
                    <div className="flex items-center justify-center mt-2">
                        <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-xs text-yellow-600 font-medium">Premium</span>
                    </div>
                )}
                {!compact && (
                    <div className="mt-3 flex justify-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">{profile.profession}</span>
                        <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium">{profile.education}</span>
                    </div>
                )}
                <div className={`mt-3 ${compact ? 'flex justify-end' : 'flex justify-center'}`} role="group" aria-label="Profile actions">
                    {profile.boostedUntil && new Date(profile.boostedUntil) > new Date() && (
                        <span className="inline-flex items-center px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs font-medium mr-2 animate-pulse" title="Boosted Profile" aria-label="Boosted Profile">Boosted</span>
                    )}
                    <Link
                        to={`/profile/${profile._id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 rounded hover:bg-blue-600 hover:text-white text-xs font-medium transition-colors"
                        aria-label="View Profile"
                    >
                        View Profile
                    </Link>
                    {onFavorite && !isFavorite && (
                        <button onClick={onFavorite} className="ml-2 text-yellow-500" title="Add to Favorites" aria-label="Add to Favorites" tabIndex={0}>
                            <StarOutline className="h-5 w-5" />
                        </button>
                    )}
                    {onUnfavorite && isFavorite && (
                        <button onClick={onUnfavorite} className="ml-2 text-yellow-500" title="Remove from Favorites" aria-label="Remove from Favorites" tabIndex={0}>
                            <StarSolid className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileCard; 