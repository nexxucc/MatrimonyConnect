import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { profileAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProfileCard from '../components/profile/ProfileCard';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { data, isLoading, error } = useQuery({
        queryKey: ['my-profile'],
        queryFn: () => profileAPI.getProfile(),
        staleTime: 5 * 60 * 1000,
        retry: 1,
        onError: (err) => {
            if (err.response && err.response.status === 404) {
                // If profile not found, redirect to edit profile page
                navigate('/profile/edit');
            }
        }
    });

    const queryClient = useQueryClient();
    const boostMutation = useMutation({
        mutationFn: () => profileAPI.post('/profiles/boost'),
        onSuccess: () => {
            queryClient.invalidateQueries(['my-profile']);
            alert('Profile boosted!');
        },
    });

    if (isLoading) return <LoadingSpinner />;

    // Handle missing profile data - this should actually be caught by the onError above
    if (error || !data || !data.profile) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-600 mb-4">Your profile is not yet created.</div>
                <Link
                    to="/profile/edit"
                    className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600"
                >
                    Create Your Profile Now
                </Link>
            </div>
        );
    }

    // Make sure we have the profile data in the expected format
    const profile = data.profile;

    // Defensive: flatten and fill missing fields for ProfileCard
    const flatProfile = {
        ...profile,
        _id: profile._id || profile.id,
        fullName: profile.basicInfo ? `${profile.basicInfo.firstName} ${profile.basicInfo.lastName}` : '',
        age: profile.age || (profile.basicInfo?.dateOfBirth ? new Date().getFullYear() - new Date(profile.basicInfo.dateOfBirth).getFullYear() : ''),
        religion: profile.religiousInfo?.religion || '',
        caste: profile.religiousInfo?.caste || '',
        city: profile.location?.city || '',
        state: profile.location?.state || '',
        profession: profile.career?.profession || '',
        education: profile.education?.highestQualification || '',
        photoUrl: (profile.photos && profile.photos.length > 0) ? profile.photos[0].url : undefined,
        isVerified: profile.isVerified || false,
        isPremium: profile.isPremium || false,
        boostedUntil: profile.boostedUntil || null,
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl shadow-sm p-8 mb-8 border border-pink-100">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-pink-800">My Profile</h1>
                    <div className="flex space-x-3">
                        <Link
                            to="/profile/edit"
                            className="inline-flex items-center px-4 py-2 bg-white border border-pink-200 text-pink-600 rounded-full hover:bg-pink-50 text-sm font-medium transition-colors shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Profile
                        </Link>
                        <Link
                            to="/subscription"
                            className="inline-flex items-center px-4 py-2 bg-white border border-pink-200 text-pink-600 rounded-full hover:bg-pink-50 text-sm font-medium transition-colors shadow-sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Manage Subscription
                        </Link>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
                    <ProfileCard profile={flatProfile} />

                    {flatProfile.boostedUntil && new Date(flatProfile.boostedUntil) > new Date() && (
                        <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                            </svg>
                            <div className="text-green-800 font-medium">
                                Your profile is boosted until {new Date(flatProfile.boostedUntil).toLocaleDateString()}! Getting up to 10x more visibility.
                            </div>
                        </div>
                    )}

                    {flatProfile.isPremium && !flatProfile.boostedUntil && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => boostMutation.mutate()}
                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-full hover:from-pink-600 hover:to-rose-700 text-sm font-medium transition shadow-md"
                                disabled={boostMutation.isLoading}
                            >
                                {boostMutation.isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Boosting...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                                        </svg>
                                        Boost My Profile for 24 Hours
                                    </>
                                )}
                            </button>
                            <p className="text-gray-500 mt-2 text-sm">Get up to 10x more profile views!</p>
                        </div>
                    )}

                    {!flatProfile.isPremium && (
                        <div className="mt-6 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-100 text-center">
                            <div className="text-amber-800 font-medium mb-2">
                                Upgrade to Premium for Unlimited Profile Boosts!
                            </div>
                            <Link
                                to="/subscription"
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full hover:from-amber-600 hover:to-yellow-600 text-sm font-medium transition shadow-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.784-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                Upgrade to Premium
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        Recent Interests
                    </h2>
                    <p className="text-gray-500 text-sm">View who has shown interest in your profile</p>
                    <Link
                        to="/interests/received"
                        className="mt-4 inline-flex items-center text-pink-600 text-sm font-medium hover:text-pink-800"
                    >
                        View All Interests
                        <svg className="ml-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                        </svg>
                        Recent Messages
                    </h2>
                    <p className="text-gray-500 text-sm">Check your conversations with potential matches</p>
                    <Link
                        to="/chat"
                        className="mt-4 inline-flex items-center text-pink-600 text-sm font-medium hover:text-pink-800"
                    >
                        Go to Messages
                        <svg className="ml-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;