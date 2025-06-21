import React, { useState } from 'react';
import { authAPI } from '../../services/api';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await authAPI.post('/auth/forgot-password', { email });
            setSuccess('Password reset instructions sent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset instructions');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-indigo-50">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Forgot Password</h1>
                {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}
                {success && <div className="mb-4 text-green-600 text-sm text-center">{success}</div>}
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full mb-6 p-2 border rounded"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-pink-600 text-white py-2 rounded font-semibold hover:bg-pink-700 transition"
                    disabled={loading}
                >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <div className="mt-4 text-center text-sm">
                    <a href="/login" className="text-pink-600 hover:underline">Back to Login</a>
                </div>
            </form>
        </div>
    );
};

export default ForgotPasswordPage;
