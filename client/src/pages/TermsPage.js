import React from 'react';
import { Helmet } from 'react-helmet-async';

const TermsPage = () => (
    <>
        <Helmet>
            <title>Terms of Service - Matrimony Connect</title>
        </Helmet>
        <div className="max-w-3xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
            <div className="space-y-6 text-gray-700">
                <p>By using Matrimony Connect, you agree to abide by our terms and conditions. Please read them carefully before registering or using our services.</p>
                <ul className="list-disc pl-6">
                    <li>You must be at least 18 years old to use this platform.</li>
                    <li>All information provided must be accurate and truthful.</li>
                    <li>Impersonation, abuse, or harassment of other users is strictly prohibited.</li>
                    <li>Premium features are subject to payment and subscription terms.</li>
                    <li>We reserve the right to suspend or terminate accounts for violations.</li>
                    <li>Your data is handled according to our Privacy Policy.</li>
                </ul>
                <p>For any questions, please contact our support team.</p>
            </div>
        </div>
    </>
);

export default TermsPage; 