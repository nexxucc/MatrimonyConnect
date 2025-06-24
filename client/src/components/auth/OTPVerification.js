import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';

const OTPVerification = ({ email, phone, method, onSuccess }) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(120); // 2 minutes countdown
    const [canResend, setCanResend] = useState(false);
    const { verifyOTP } = useAuth();

    // Setup countdown timer for OTP resend
    useEffect(() => {
        if (countdown > 0 && !canResend) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && !canResend) {
            setCanResend(true);
        }
    }, [countdown, canResend]);

    // Format countdown time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            // Always send phone (and email if method is email)
            const payload = method === 'email'
                ? { email, otp, method }
                : { phone, otp, method };

            const result = await verifyOTP(payload);
            if (result.success) {
                setSuccess('Verification successful!');
                onSuccess?.();
            } else {
                setError(result.error || 'Verification failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!canResend && countdown > 0) return;

        setError('');
        setSuccess('');
        setLoading(true);
        try {
            if (method === 'email') {
                await authAPI.sendVerificationOTP({ email, method });
            } else {
                await authAPI.sendVerificationOTP({ phone, method });
            }

            // Determine medium text
            let medium = 'phone';
            if (method === 'email') medium = 'email';
            else if (method === 'whatsapp') medium = 'WhatsApp';

            setSuccess(`Code sent! Please check your ${medium}`);
            setCountdown(120);
            setCanResend(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend code');
        } finally {
            setLoading(false);
        }
    };    // Method-specific icons and messaging
    const methodDetails = {
        email: {
            title: 'Email Verification',
            icon: (
                <svg className="w-16 h-16 text-pink-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
            ),
            message: `We've sent a verification code to ${email}. Please check your inbox and spam folder.`
        },
        whatsapp: {
            title: 'WhatsApp Verification',
            icon: (
                <svg className="w-16 h-16 text-green-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                    <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                    <path d="M8 13h8" />
                </svg>
            ),
            message: `We've sent a verification code to your WhatsApp on ${phone}. Please check your messages.`
        }
    };

    const currentMethod = methodDetails[method] || methodDetails.sms;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-indigo-50">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-pink-100">
                <div className="text-center mb-6">
                    {currentMethod.icon}
                    <h2 className="text-2xl font-bold text-pink-700 mt-4">{currentMethod.title}</h2>
                    <p className="text-gray-600 text-sm mt-2">{currentMethod.message}</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg text-center">
                        {success}
                    </div>
                )}

                <div className="mb-6">
                    <label htmlFor="otp" className="block text-gray-700 text-sm font-medium mb-2">
                        Verification Code
                    </label>
                    <input
                        type="text"
                        id="otp"
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                        placeholder="Enter 6-digit code"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors text-center text-2xl tracking-widest"
                        required
                        maxLength="6"
                        pattern="\d{6}"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-rose-700 transition shadow-md"
                    disabled={loading || otp.length !== 6}
                >
                    {loading ? 'Verifying...' : 'Verify Code'}
                </button>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">
                        {!canResend
                            ? `Resend code in ${formatTime(countdown)}`
                            : "Didn't receive the code?"}
                    </p>
                    <button
                        type="button"
                        onClick={handleResendOTP}
                        className={`text-sm font-medium ${canResend
                            ? 'text-pink-600 hover:text-pink-700 cursor-pointer'
                            : 'text-gray-400 cursor-not-allowed'
                            }`}
                        disabled={!canResend || loading}
                    >
                        Resend Code
                    </button>
                </div>
            </form>
        </div>);
};

OTPVerification.propTypes = {
    email: PropTypes.string,
    phone: PropTypes.string,
    method: PropTypes.string.isRequired,
    onSuccess: PropTypes.func
};

export default OTPVerification;
