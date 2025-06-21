import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchAPI } from '../services/api';
import ProfileCard from '../components/profile/ProfileCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const defaultFilters = {
    ageMin: '',
    ageMax: '',
    religion: '',
    caste: '',
    region: '',
    profession: '',
    lifestyle: '',
};

const SearchPage = () => {
    const [filters, setFilters] = useState(defaultFilters);
    const [searchParams, setSearchParams] = useState(defaultFilters);

    const queryClient = useQueryClient();
    const favoriteMutation = useMutation({
        mutationFn: (profileId) => searchAPI.post(`/users/favorites/${profileId}`),
        onSuccess: () => queryClient.invalidateQueries(['search', searchParams]),
    });
    const unfavoriteMutation = useMutation({
        mutationFn: (profileId) => searchAPI.delete(`/users/favorites/${profileId}`),
        onSuccess: () => queryClient.invalidateQueries(['search', searchParams]),
    });
    const saveSearchMutation = useMutation({
        mutationFn: (filters) => searchAPI.post('/users/saved-searches', filters),
        onSuccess: () => queryClient.invalidateQueries(['saved-searches']),
    });
    const { data: savedSearches } = useQuery({
        queryKey: ['saved-searches'],
        queryFn: () => searchAPI.get('/users/saved-searches'),
    });
    const { data: favorites } = useQuery({
        queryKey: ['favorites'],
        queryFn: () => searchAPI.get('/users/favorites'),
    });

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['search', searchParams],
        queryFn: () => searchAPI.get('/search', { params: searchParams }),
        keepPreviousData: true,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSearchParams(filters);
        refetch();
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Search Profiles</h1>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="number" name="ageMin" value={filters.ageMin} onChange={handleChange} placeholder="Min Age" className="border-gray-300 rounded-md p-2" />
                <input type="number" name="ageMax" value={filters.ageMax} onChange={handleChange} placeholder="Max Age" className="border-gray-300 rounded-md p-2" />
                <input type="text" name="religion" value={filters.religion} onChange={handleChange} placeholder="Religion" className="border-gray-300 rounded-md p-2" />
                <input type="text" name="caste" value={filters.caste} onChange={handleChange} placeholder="Caste" className="border-gray-300 rounded-md p-2" />
                <input type="text" name="region" value={filters.region} onChange={handleChange} placeholder="Region/State" className="border-gray-300 rounded-md p-2" />
                <input type="text" name="profession" value={filters.profession} onChange={handleChange} placeholder="Profession" className="border-gray-300 rounded-md p-2" />
                <input type="text" name="lifestyle" value={filters.lifestyle} onChange={handleChange} placeholder="Lifestyle" className="border-gray-300 rounded-md p-2" />
                <button
                    type="button"
                    className="bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 font-semibold mt-2 ml-2"
                    onClick={() => saveSearchMutation.mutate(filters)}
                >
                    Save Search
                </button>
                <button type="submit" className="col-span-1 md:col-span-3 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold mt-2">Search</button>
            </form>
            {isLoading ? (
                <LoadingSpinner />
            ) : error ? (
                <div className="text-center text-red-600">Failed to load profiles.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data && data.length > 0 ? (
                        data.map((profile) => <ProfileCard key={profile._id} profile={profile} onFavorite={() => favoriteMutation.mutate(profile._id)} onUnfavorite={() => unfavoriteMutation.mutate(profile._id)} isFavorite={favorites?.some(f => f._id === profile._id)} />)
                    ) : (
                        <div className="col-span-full text-center text-gray-600 py-12">No profiles found matching your criteria.</div>
                    )}
                </div>
            )}
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">Saved Searches</h2>
                <ul className="space-y-2">
                    {savedSearches?.length > 0 ? savedSearches.map((s, i) => (
                        <li key={i} className="text-gray-700 text-sm border-b last:border-b-0 py-2">
                            {JSON.stringify(s)}
                        </li>
                    )) : <li className="text-gray-500">No saved searches.</li>}
                </ul>
            </div>
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">Favorite Profiles</h2>
                <ul className="space-y-2">
                    {favorites?.length > 0 ? favorites.map((p) => (
                        <li key={p._id} className="text-gray-700 text-sm border-b last:border-b-0 py-2">
                            {p.fullName}
                        </li>
                    )) : <li className="text-gray-500">No favorites yet.</li>}
                </ul>
            </div>
        </div>
    );
};

export default SearchPage; 