import React from 'react';
import { Helmet } from 'react-helmet-async';

const team = [
    { name: 'Vikram Jain', role: 'Founder & CEO' },
    { name: 'Priya Sharma', role: 'Head of Operations' },
    { name: 'Rahul Mehta', role: 'Lead Developer' },
    { name: 'Anjali Patel', role: 'Customer Success' },
];

const AboutPage = () => (
    <>
        <Helmet>
            <title>About Us - Matrimony Connect</title>
        </Helmet>
        <div className="max-w-4xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">About Matrimony Connect</h1>
            <p className="text-lg text-gray-700 mb-6">
                Matrimony Connect is a modern matchmaking platform dedicated to helping individuals find their perfect life partner in a secure, trusted, and personalized environment. Our mission is to empower people to make meaningful connections based on compatibility, values, and trust.
            </p>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Values</h2>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Privacy & Security First</li>
                <li>Authentic, Verified Profiles</li>
                <li>Personalized Matchmaking</li>
                <li>Respect for Diversity</li>
                <li>Supportive Community</li>
            </ul>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Meet the Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {team.map((member) => (
                    <div key={member.name} className="bg-white rounded-lg shadow p-4">
                        <div className="font-bold text-gray-900">{member.name}</div>
                        <div className="text-gray-600">{member.role}</div>
                    </div>
                ))}
            </div>
            <div className="text-center mt-8">
                <a href="/register" className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition">Join Matrimony Connect</a>
            </div>
        </div>
    </>
);

export default AboutPage; 