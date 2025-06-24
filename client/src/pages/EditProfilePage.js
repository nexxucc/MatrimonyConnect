import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EditProfilePage = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();    // Create initial form state for a new profile
    const initialFormState = {
        basicInfo: {
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            gender: 'male',
            maritalStatus: 'never_married',
            children: 'no',
            physicalStatus: 'normal'
        },
        location: {
            country: 'India',
            state: '',
            city: '',
            willingToRelocate: true
        },
        religiousInfo: {
            religion: 'Hindu',
            caste: '',
            motherTongue: ''
        },
        education: {
            highestQualification: 'Bachelors'
        },
        career: {
            profession: '',
            income: 'below_5_lakhs'
        },
        preferences: {
            ageMin: 18,
            ageMax: 40,
            heightMin: 150,
            heightMax: 190,
            interestedIn: 'opposite' // 'opposite', 'same', or 'both'
        },
        about: '',
        isProfileComplete: false
    };

    const [form, setForm] = useState(initialFormState);
    const [isNewProfile, setIsNewProfile] = useState(false);
    const [loading, setLoading] = useState(true); const { data, isLoading } = useQuery({
        queryKey: ['my-profile'],
        queryFn: () => profileAPI.getProfile(),
        retry: 1,
        onError: (err) => {
            if (err.response && err.response.status === 404) {
                // Profile doesn't exist yet
                setIsNewProfile(true);
            }
            setLoading(false);
        },
        onSuccess: () => {
            setLoading(false);
        }
    }); useEffect(() => {
        // Handle profile data loading
        if (data?.profile) {
            setForm(data.profile);
            setIsNewProfile(false);
            setLoading(false);
        } else if (!isLoading) {
            // If done loading and no profile data, either it's a 404 (new profile)
            // or some other issue, but we should stop the loading state
            setLoading(false);
        }
    }, [data, isLoading]); const mutation = useMutation({
        mutationFn: (profileData) => profileAPI.updateProfile(profileData),
        onSuccess: () => {
            queryClient.invalidateQueries(['my-profile']);
            // After profile creation, navigate to search page (discover people)
            // If it's a new profile, go to search, otherwise back to profile
            if (isNewProfile) {
                navigate('/search');
            } else {
                navigate('/profile');
            }
        },
        onError: (error) => {
            console.error("Failed to save profile:", error);
            alert('Failed to save profile. Please check the form and try again.');
        }
    });

    if (loading) return <LoadingSpinner />;

    const handleChange = (section, field, value) => {
        setForm(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mark the profile as complete
        const completeForm = {
            ...form,
            isProfileComplete: true
        };
        mutation.mutate(completeForm);
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    {isNewProfile ? 'Create Your Profile' : 'Edit Your Profile'}
                </h1>

                {mutation.isLoading ? (
                    <div className="text-center py-10">
                        <LoadingSpinner />
                        <p className="mt-4 text-gray-600">Saving your profile...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info Section */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h2 className="text-lg font-medium text-gray-800 mb-4">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name*</label>
                                    <input
                                        type="text"
                                        value={form.basicInfo?.firstName || ''}
                                        onChange={(e) => handleChange('basicInfo', 'firstName', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-500 focus:ring-opacity-50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name*</label>
                                    <input
                                        type="text"
                                        value={form.basicInfo?.lastName || ''}
                                        onChange={(e) => handleChange('basicInfo', 'lastName', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-500 focus:ring-opacity-50"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date of Birth*</label>
                                    <input
                                        type="date"
                                        value={form.basicInfo?.dateOfBirth ? new Date(form.basicInfo.dateOfBirth).toISOString().split('T')[0] : ''}
                                        onChange={(e) => handleChange('basicInfo', 'dateOfBirth', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-500 focus:ring-opacity-50"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Gender*</label>
                                    <select
                                        value={form.basicInfo?.gender || 'male'}
                                        onChange={(e) => handleChange('basicInfo', 'gender', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-500 focus:ring-opacity-50"
                                        required
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Location Section */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h2 className="text-lg font-medium text-gray-800 mb-4">Location</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Country*</label>
                                    <input
                                        type="text"
                                        value={form.location?.country || ''}
                                        onChange={(e) => handleChange('location', 'country', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-500 focus:ring-opacity-50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">State*</label>
                                    <input
                                        type="text"
                                        value={form.location?.state || ''}
                                        onChange={(e) => handleChange('location', 'state', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-500 focus:ring-opacity-50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">City*</label>
                                    <input
                                        type="text"
                                        value={form.location?.city || ''}
                                        onChange={(e) => handleChange('location', 'city', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-500 focus:ring-opacity-50"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Religious Info Section */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h2 className="text-lg font-medium text-gray-800 mb-4">Religious Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Religion*</label>
                                    <input
                                        type="text"
                                        value={form.religiousInfo?.religion || ''}
                                        onChange={(e) => handleChange('religiousInfo', 'religion', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-500 focus:ring-opacity-50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Caste</label>
                                    <input
                                        type="text"
                                        value={form.religiousInfo?.caste || ''}
                                        onChange={(e) => handleChange('religiousInfo', 'caste', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-500 focus:ring-opacity-50"
                                    />
                                </div>
                            </div>
                        </div>                        {/* Career & Education Section */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h2 className="text-lg font-medium text-gray-800 mb-4">Career & Education</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Profession*</label>
                                    <input
                                        type="text"
                                        value={form.career?.profession || ''}
                                        onChange={(e) => handleChange('career', 'profession', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-500 focus:ring-opacity-50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Highest Education*</label>
                                    <input
                                        type="text"
                                        value={form.education?.highestQualification || ''}
                                        onChange={(e) => handleChange('education', 'highestQualification', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-500 focus:ring-opacity-50"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preferences Section */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h2 className="text-lg font-medium text-gray-800 mb-4">Preferences</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">I am interested in*</label>
                                    <select
                                        value={form.preferences?.interestedIn || 'opposite'}
                                        onChange={(e) => handleChange('preferences', 'interestedIn', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-500 focus:ring-opacity-50"
                                        required
                                    >
                                        <option value="opposite">{form.basicInfo?.gender === 'male' ? 'Women' : 'Men'}</option>
                                        <option value="same">{form.basicInfo?.gender === 'male' ? 'Men' : 'Women'}</option>
                                        <option value="both">Both</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* About Me Section */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h2 className="text-lg font-medium text-gray-800 mb-4">About Me</h2>
                            <div>
                                <textarea
                                    value={form.about || ''}
                                    onChange={(e) => setForm(prev => ({ ...prev, about: e.target.value }))}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-500 focus:ring-opacity-50"
                                    rows={4}
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </div>

                        <div className="text-right">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-colors shadow-sm"
                                disabled={mutation.isLoading}
                            >
                                {isNewProfile ? 'Create Profile' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default EditProfilePage;