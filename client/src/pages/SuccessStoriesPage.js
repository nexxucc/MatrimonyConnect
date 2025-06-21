import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

const sampleStories = [
    {
        name: 'Priya & Rahul',
        location: 'Mumbai',
        text: 'We found each other on Matrimony Connect and got married within 6 months. Thank you for helping us find our perfect match!',
        photo: '/couple1.jpg'
    },
    {
        name: 'Anjali & Vikram',
        location: 'Delhi',
        text: 'The platform made it so easy to connect with like-minded people. We are grateful for this wonderful journey.',
        photo: '/couple2.jpg'
    },
];

const SuccessStoriesPage = () => {
    const [form, setForm] = useState({ name: '', partner: '', story: '', photo: null });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        // Here you would send the story to the backend
    };

    return (
        <>
            <Helmet>
                <title>Success Stories - Matrimony Connect</title>
            </Helmet>
            <div className="max-w-4xl mx-auto py-12 px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Success Stories</h1>
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {sampleStories.map((story, idx) => (
                        <div key={idx} className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                            <img src={story.photo} alt={story.name} className="h-24 w-24 rounded-full object-cover mb-4" />
                            <div className="font-bold text-lg text-gray-900 mb-1">{story.name}</div>
                            <div className="text-pink-600 mb-2">{story.location}</div>
                            <p className="text-gray-700 italic">"{story.text}"</p>
                        </div>
                    ))}
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Share Your Story</h2>
                {submitted ? (
                    <div className="bg-green-100 text-green-800 p-4 rounded mb-6">Thank you for sharing your story! Our team will review and publish it soon.</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg shadow p-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Your Name</label>
                            <input type="text" name="name" value={form.name} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Partner's Name</label>
                            <input type="text" name="partner" value={form.partner} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Your Story</label>
                            <textarea name="story" value={form.story} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md" rows={4} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Photo (optional)</label>
                            <input type="file" name="photo" accept="image/*" onChange={handleChange} className="mt-1 block w-full" />
                        </div>
                        <button type="submit" className="w-full py-2 px-4 bg-pink-600 text-white rounded hover:bg-pink-700 font-semibold">Submit Story</button>
                    </form>
                )}
                <div className="text-center mt-8">
                    <a href="/register" className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition">Join Matrimony Connect</a>
                </div>
            </div>
        </>
    );
};

export default SuccessStoriesPage; 