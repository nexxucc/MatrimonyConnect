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
                Matrimony Connect started with a simple idea: make it easier for people and families to find a compatible life partner without the usual hassle. We built a platform that's secure, straightforward, and focused on real connections. Every profile is verified, privacy is respected, and the focus is on compatibility — values, background, and what matters most to you.
            </p>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Values</h2>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
                <li>Your data and privacy come first</li>
                <li>Every profile is reviewed and verified</li>
                <li>Matching based on what actually matters to you</li>
                <li>Open to all communities and backgrounds</li>
                <li>A team that's here when you need help</li>
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