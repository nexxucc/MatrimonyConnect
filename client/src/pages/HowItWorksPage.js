import React from 'react';
import { Helmet } from 'react-helmet-async';

const steps = [
    {
        title: 'Register & Verify',
        description: 'Create an account with your email or phone number. We\'ll send you a code to verify it\'s really you.'
    },
    {
        title: 'Create Your Profile',
        description: 'Add your details, write a bit about yourself, and upload some recent photos. The more complete your profile, the better your matches.'
    },
    {
        title: 'Search & Discover',
        description: 'Filter by age, location, religion, education, and more to find people who fit what you\'re looking for.'
    },
    {
        title: 'Express Interest',
        description: 'See someone you like? Send them an interest and include a personal note if you want.'
    },
    {
        title: 'Connect & Chat',
        description: 'Once an interest is accepted, open up a conversation. Premium members get full chat access.'
    },
    {
        title: 'Find Your Match',
        description: 'When you\'ve found the right person, take the next step. That\'s what we\'re here for.'
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