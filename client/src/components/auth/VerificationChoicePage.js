import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import OTPVerification from './OTPVerification';

const VerificationChoicePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { email, phone } = location.state || {};
    const [method, setMethod] = useState('email');
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async () => {
        setError('');
        setLoading(true);
        try {
            if (method === 'email') {
                await authAPI.sendVerificationOTP({ email });
            } else {
                await authAPI.sendVerificationOTP({ phone });
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
    }

    if (otpSent) {
        return (
            <OTPVerification
                email={email}
                phone={phone}
                method={method}
                onSuccess={() => navigate('/profile/edit')}
            />
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-indigo-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Choose Verification Method</h2>
                {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}
                <div className="mb-6">
                    <label className="block mb-1 font-medium">Verify via:</label>
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input type="radio" name="otpMethod" value="email" checked={method === 'email'} onChange={() => setMethod('email')} />
                            <span className="ml-2">Email</span>
                        </label>
                        <label className="flex items-center">
                            <input type="radio" name="otpMethod" value="phone" checked={method === 'phone'} onChange={() => setMethod('phone')} />
                            <span className="ml-2">Phone</span>
                        </label>
                    </div>
                </div>
                {method === 'email' && (
                    <input type="email" value={email} disabled className="w-full mb-4 p-2 border rounded bg-gray-100" />
                )}
                {method === 'phone' && (
                    <input type="tel" value={phone} disabled className="w-full mb-4 p-2 border rounded bg-gray-100" />
                )}
                <button
                    onClick={handleSendOTP}
                    className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
                    disabled={loading}
                >
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
            </div>
        </div>
    );
};

export default VerificationChoicePage;
