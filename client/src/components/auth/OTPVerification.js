import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';

const OTPVerification = ({ email, phone, method, onSuccess }) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { verifyOTP } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            // Always send phone (and email if method is email)
            const payload = method === 'email' ? { email, phone, otp } : { phone, otp };
            const result = await verifyOTP(payload);
            if (result.success) {
                setSuccess('Verification successful!');
                onSuccess && onSuccess();
            } else {
                setError(result.error || 'Verification failed');
            }
        } catch (err) {
            setError('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            if (method === 'email') {
                await authAPI.sendVerificationOTP({ email });
            } else {
                await authAPI.sendVerificationOTP({ phone });
            }
            setSuccess('OTP sent! Please check your ' + (method === 'email' ? 'email.' : 'phone.'));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md mx-auto mt-8">
            <h2 className="text-xl font-bold mb-4 text-center">Verify your {method === 'email' ? 'Email' : 'Phone'}</h2>
            {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}
            {success && <div className="mb-4 text-green-600 text-sm text-center">{success}</div>}
            {method === 'email' && (
                <input type="email" value={email} disabled className="w-full mb-4 p-2 border rounded bg-gray-100" />
            )}
            {method === 'phone' && (
                <input type="tel" value={phone} disabled className="w-full mb-4 p-2 border rounded bg-gray-100" />
            )}
            <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP" className="w-full mb-4 p-2 border rounded" required />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify'}
            </button>
            <button type="button" onClick={handleResendOTP} className="w-full mt-2 bg-gray-200 text-gray-800 py-2 rounded font-semibold hover:bg-gray-300 transition" disabled={loading}>
                Resend OTP
            </button>
        </form>
    );
};

export default OTPVerification;
