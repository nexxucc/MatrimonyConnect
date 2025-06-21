import React from 'react';
import { Helmet } from 'react-helmet-async';

const PrivacyPage = () => (
    <>
        <Helmet>
            <title>Privacy Policy - Matrimony Connect</title>
        </Helmet>
        <div className="max-w-3xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
            <div className="space-y-6 text-gray-700">
                <p>Matrimony Connect is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information.</p>
                <ul className="list-disc pl-6">
                    <li>We collect information you provide during registration, profile creation, and usage of our services.</li>
                    <li>Your data is encrypted and stored securely. We do not sell or share your data with third parties without your consent.</li>
                    <li>You control your profile visibility and who can contact you.</li>
                    <li>We use cookies and analytics to improve our services.</li>
                    <li>You may request deletion or correction of your data at any time.</li>
                </ul>
                <p>For detailed information or requests, please contact our support team.</p>
            </div>
        </div>
    </>
);

export default PrivacyPage; 