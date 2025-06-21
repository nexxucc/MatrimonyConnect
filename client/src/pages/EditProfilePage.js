import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EditProfilePage = () => {
    const queryClient = useQueryClient();
    const { data, isLoading, error } = useQuery({
        queryKey: ['my-profile'],
        queryFn: () => profileAPI.get('/profiles/me'),
    });
    const [form, setForm] = useState(null);
    React.useEffect(() => {
        if (data) setForm(data);
    }, [data]);

    const mutation = useMutation({
        mutationFn: (updated) => profileAPI.put('/profiles/me', updated),
        onSuccess: () => {
            queryClient.invalidateQueries(['my-profile']);
            alert('Profile updated!');
        },
    });

    if (isLoading || !form) return <LoadingSpinner />;
    if (error) return <div className="p-8 text-center text-red-600">Failed to load profile.</div>;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(form);
    };

    // Privacy settings UI
    const handlePrivacyChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            privacySettings: {
                ...prev.privacySettings,
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        value={form.fullName || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <input
                        type="number"
                        name="age"
                        value={form.age || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Religion</label>
                    <input
                        type="text"
                        name="religion"
                        value={form.religion || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Caste</label>
                    <input
                        type="text"
                        name="caste"
                        value={form.caste || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                        type="text"
                        name="city"
                        value={form.city || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                        type="text"
                        name="state"
                        value={form.state || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-8">Privacy Settings</h2>
                <div className="space-y-4 bg-gray-50 rounded-lg p-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hide Profile</label>
                        <input
                            type="checkbox"
                            name="isHidden"
                            checked={form.privacySettings?.isHidden || false}
                            onChange={handlePrivacyChange}
                            className="mr-2"
                        />
                        <span className="text-gray-600">Hide my profile from search and public view</span>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Who can contact me?</label>
                        <select
                            name="whoCanContact"
                            value={form.privacySettings?.whoCanContact || 'all'}
                            onChange={handlePrivacyChange}
                            className="mt-1 block w-full border-gray-300 rounded-md"
                        >
                            <option value="all">Anyone</option>
                            <option value="matches">Only my matches</option>
                            <option value="none">No one</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Show Photos</label>
                        <input
                            type="checkbox"
                            name="showPhotos"
                            checked={form.privacySettings?.showPhotos || false}
                            onChange={handlePrivacyChange}
                            className="mr-2"
                        />
                        <span className="text-gray-600">Allow others to see my photos</span>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Show Contact Info</label>
                        <input
                            type="checkbox"
                            name="showContact"
                            checked={form.privacySettings?.showContact || false}
                            onChange={handlePrivacyChange}
                            className="mr-2"
                        />
                        <span className="text-gray-600">Allow others to see my contact info</span>
                    </div>
                </div>
                {/* Add more fields as needed */}
                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                    disabled={mutation.isLoading}
                >
                    {mutation.isLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

export default EditProfilePage; 