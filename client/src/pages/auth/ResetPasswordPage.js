import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const query = useQuery();
    const navigate = useNavigate();
    const token = query.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await authAPI.post('/auth/reset-password', { token, password });
            setSuccess('Password reset successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-indigo-50">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
                {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}
                {success && <div className="mb-4 text-green-600 text-sm text-center">{success}</div>}
                <input
                    type="password"
                    placeholder="New Password"
                    className="w-full mb-4 p-2 border rounded"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="w-full mb-6 p-2 border rounded"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-pink-600 text-white py-2 rounded font-semibold hover:bg-pink-700 transition"
                    disabled={loading}
                >
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
                <div className="mt-4 text-center text-sm">
                    <a href="/login" className="text-pink-600 hover:underline">Back to Login</a>
                </div>
            </form>
        </div>
    );
};

export default ResetPasswordPage;
