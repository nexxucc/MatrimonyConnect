import React from 'react';
import { Helmet } from 'react-helmet-async';

const faqs = [
    {
        question: 'Is Matrimony Connect free to use?',
        answer: 'You can register, create a profile, and use basic search for free. Premium features like chat and profile boost require a subscription.'
    },
    {
        question: 'How do you verify profiles?',
        answer: 'We use a combination of manual review, document verification, and phone/email OTP to ensure authenticity.'
    },
    {
        question: 'How is my privacy protected?',
        answer: 'Your data is encrypted and never shared without your consent. You control who can see your profile and contact you.'
    },
    {
        question: 'How do I upgrade to premium?',
        answer: 'Go to the Subscription page in your dashboard and choose a premium plan. Payments are securely processed via Stripe.'
    },
    {
        question: 'Can I hide or deactivate my profile?',
        answer: 'Yes, you can hide your profile or deactivate your account from your profile settings at any time.'
    },
    {
        question: 'How do I report abuse or suspicious activity?',
        answer: 'Use the Report button on any profile or contact our support team via the Contact page.'
    },
];

const FAQPage = () => (
    <>
        <Helmet>
            <title>FAQ - Matrimony Connect</title>
        </Helmet>
        <div className="max-w-3xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>
            <div className="space-y-6">
                {faqs.map((faq, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow p-4">
                        <div className="font-semibold text-gray-900 mb-2">{faq.question}</div>
                        <div className="text-gray-700">{faq.answer}</div>
                    </div>
                ))}
            </div>
        </div>
    </>
);

export default FAQPage; 