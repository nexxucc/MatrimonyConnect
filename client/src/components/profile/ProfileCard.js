import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import PropTypes from 'prop-types';

const ProfileCard = ({ profile, compact, onFavorite, onUnfavorite, isFavorite }) => {
    if (!profile) return null;

    // Calculate astrological sign based on DOB (simplified version)
    const getZodiacSign = (dob) => {
        if (!dob) return '';
        try {
            const date = new Date(dob);
            const day = date.getDate();
            const month = date.getMonth() + 1;

            if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
            if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
            if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
            if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
            if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
            if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
            if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
            if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
            if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
            if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
            if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
            if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
            return '';
        } catch (e) {
            return '';
        }
    };

    // Optional: Display zodiac sign if dob exists
    const zodiacSign = profile.dob ? getZodiacSign(profile.dob) : '';

    return (
        <div className={`bg-white rounded-xl shadow overflow-hidden ${compact ? '' : 'border border-pink-100'} hover:shadow-lg transition-all duration-300`}>
            {/* Banner decoration */}
            {!compact && <div className="h-3 bg-gradient-to-r from-pink-500 to-rose-600"></div>}

            <div className={`p-5 flex ${compact ? 'items-center space-x-4' : 'flex-col'}`}>
                {/* Profile photo with premium indicator */}
                <div className={`relative ${compact ? 'flex-shrink-0' : 'mx-auto'}`}>                    <Link to={`/profile/${profile._id}`} className="block">
                    <img
                        src={profile.photoUrl || '/default-profile.svg'}
                        alt={profile.fullName}
                        className={`object-cover ${compact ? 'h-20 w-20 rounded-lg' : 'h-36 w-36 rounded-xl'} border-2 ${profile.isVerified ? 'border-pink-400' : 'border-gray-200'}`}
                    />
                </Link>

                    {profile.isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                            <CheckBadgeIcon className="h-6 w-6 text-pink-500" title="Verified" />
                        </div>
                    )}

                    {profile.isPremium && (
                        <div className="absolute top-0 right-0">
                            <div className="bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs px-1.5 py-0.5 rounded-tr-lg rounded-bl-lg font-medium shadow">
                                Premium
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile info */}
                <div className={compact ? 'flex-1 min-w-0' : 'mt-4 text-center'}>
                    <Link to={`/profile/${profile._id}`} className="block font-semibold text-gray-800 text-lg hover:text-pink-600 transition-colors">
                        {profile.fullName}
                    </Link>

                    <div className={`text-gray-700 ${compact ? 'text-sm' : 'text-base'} mt-1`}>{profile.age} yrs, {profile.religion} {profile.caste ? `| ${profile.caste}` : ''}</div>

                    <div className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'} mt-1 mb-2`}>
                        <span className="flex items-center justify-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {profile.city}{profile.state ? `, ${profile.state}` : ''}
                        </span>
                    </div>

                    {!compact && (
                        <div className="my-3 flex flex-wrap justify-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-50 text-pink-600">
                                {profile.profession}
                            </span>                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600">
                                {typeof profile.education === 'object' ? profile.education.highestQualification || '' : profile.education}
                            </span>
                            {zodiacSign && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                                    {zodiacSign}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Profile actions */}
                    <div className={`mt-3 ${compact ? 'flex justify-end' : 'flex justify-center space-x-3'}`}>
                        {profile.boostedUntil && new Date(profile.boostedUntil) > new Date() && (
                            <span className="inline-flex items-center px-2 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium mr-2 animate-pulse">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                                </svg>
                                Boosted
                            </span>
                        )}

                        <Link
                            to={`/profile/${profile._id}`}
                            className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-full hover:from-pink-600 hover:to-rose-700 text-xs font-medium transition-colors shadow-sm"
                        >
                            View Profile
                        </Link>

                        {onFavorite && !isFavorite && (
                            <button onClick={onFavorite} className="ml-2 p-1.5 rounded-full border border-pink-200 text-pink-500 hover:bg-pink-50" title="Add to Favorites">
                                <HeartIcon className="h-4 w-4" />
                            </button>
                        )}

                        {onUnfavorite && isFavorite && (
                            <button onClick={onUnfavorite} className="ml-2 p-1.5 rounded-full border border-pink-200 bg-pink-50 text-pink-500" title="Remove from Favorites">
                                <HeartIcon className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

ProfileCard.propTypes = {
    profile: PropTypes.shape({
        _id: PropTypes.string,
        fullName: PropTypes.string,
        photoUrl: PropTypes.string,
        dob: PropTypes.string,
        age: PropTypes.number,
        religion: PropTypes.string,
        caste: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string, profession: PropTypes.string,
        education: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object
        ]),
        isVerified: PropTypes.bool,
        isPremium: PropTypes.bool,
        boostedUntil: PropTypes.string
    }),
    compact: PropTypes.bool,
    onFavorite: PropTypes.func,
    onUnfavorite: PropTypes.func,
    isFavorite: PropTypes.bool
};

export default ProfileCard;