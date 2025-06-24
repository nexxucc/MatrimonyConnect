import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import OTPVerification from './OTPVerification';

const VerificationChoicePage = () => {
    const location = useLocation();
    const navigate = useNavigate(); const { email, phone } = location.state || {};
    // Always default to email if available, otherwise WhatsApp
    const [method, setMethod] = useState(email ? 'email' : 'whatsapp');
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Helper function to get verification method display text
    const getMethodText = () => {
        if (method === 'email') return 'email address';
        if (method === 'whatsapp') return 'WhatsApp';
        return 'phone via SMS';
    };

    const handleSendOTP = async () => {
        setError('');
        setLoading(true);
        try {
            if (method === 'email') {
                await authAPI.sendVerificationOTP({ email, method });
            } else {
                await authAPI.sendVerificationOTP({ phone, method });
            }
            setOtpSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    if (!email && !phone) {
        return <div className="text-center mt-10 text-red-600">Missing registration details. Please register again.</div>;
    } if (otpSent) {
        return (
            <OTPVerification
                email={email}
                phone={phone}
                method={method}
                onSuccess={() => {
                    navigate('/profile/edit', { replace: true });
                }}
            />
        );
    } return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-indigo-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-pink-100">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-pink-700 mb-1">Verify Your Account</h2>
                    <p className="text-gray-600 text-sm">Choose your preferred verification method</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
                        {error}
                    </div>
                )}                <div className="mb-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {email && (
                            <label
                                htmlFor="email-method"
                                className={`flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer border-2 transition-all ${method === 'email'
                                    ? 'border-pink-500 bg-pink-50'
                                    : 'border-gray-200 hover:border-pink-300'
                                    }`}
                            >
                                <div className={`p-3 rounded-full ${method === 'email' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="20" height="16" x="2" y="4" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                </div>
                                <div className="mt-3 text-center">
                                    <label htmlFor="email-method" className="font-medium block">Email</label>
                                    <input
                                        type="radio"
                                        id="email-method"
                                        name="otpMethod"
                                        value="email"
                                        checked={method === 'email'}
                                        onChange={() => setMethod('email')}
                                        className="sr-only"
                                    />
                                    <span className="text-xs text-gray-500 mt-1 block">{email}</span>
                                </div>
                            </label>
                        )}                    {phone && (<label
                            htmlFor="whatsapp-method"
                            className={`flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer border-2 transition-all ${method === 'whatsapp'
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-green-300'
                                }`}
                        >
                            <div className={`p-3 rounded-full ${method === 'whatsapp' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'
                                }`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                                    <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                                    <path d="M8 13h8" />
                                </svg>
                            </div>
                            <div className="mt-3 text-center">
                                <label htmlFor="whatsapp-method" className="font-medium block">WhatsApp</label>
                                <input
                                    type="radio"
                                    id="whatsapp-method"
                                    name="otpMethod"
                                    value="whatsapp"
                                    checked={method === 'whatsapp'}
                                    onChange={() => setMethod('whatsapp')}
                                    className="sr-only"
                                />
                                <span className="text-xs text-gray-500 mt-1 block">{phone}</span>
                            </div>
                        </label>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleSendOTP}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-rose-700 transition shadow-md"
                    disabled={loading}
                >
                    {loading ? 'Sending OTP...' : 'Send Verification Code'}
                </button>                <p className="mt-4 text-xs text-gray-500 text-center">
                    We'll send a verification code to your {getMethodText()}
                </p>
            </div>
        </div>
    );
};

export default VerificationChoicePage;
