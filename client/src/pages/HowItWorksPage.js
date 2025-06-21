import React from 'react';
import { Helmet } from 'react-helmet-async';

const steps = [
    {
        title: 'Register & Verify',
        description: 'Sign up with your email or phone, verify your identity with OTP, and set up your secure account.'
    },
    {
        title: 'Create Your Profile',
        description: 'Fill in your personal details, preferences, and upload photos to complete your profile.'
    },
    {
        title: 'Search & Discover',
        description: 'Use advanced filters to search for compatible matches based on your criteria.'
    },
    {
        title: 'Express Interest',
        description: 'Send interest requests to profiles you like and receive interests from others.'
    },
    {
        title: 'Connect & Chat',
        description: 'Upgrade to premium to chat with your matches and get to know them better.'
    },
    {
        title: 'Find Your Match',
        description: 'Take the next step towards a lifelong relationship with your perfect match!'
    }
];

const HowItWorksPage = () => (
    <>
        <Helmet>
            <title>How It Works - Matrimony Connect</title>
        </Helmet>
        <div className="max-w-3xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">How Matrimony Connect Works</h1>
            <ol className="space-y-8">
                {steps.map((step, idx) => (
                    <li key={step.title} className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-xl mr-4">{idx + 1}</div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-1">{step.title}</h2>
                            <p className="text-gray-700">{step.description}</p>
                        </div>
                    </li>
                ))}
            </ol>
            <div className="text-center mt-12">
                <a href="/register" className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition">Get Started</a>
            </div>
        </div>
    </>
);

export default HowItWorksPage; 