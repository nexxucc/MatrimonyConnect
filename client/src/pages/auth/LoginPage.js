import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            setError("");
            setLoading(true);
            const result = await login({ email, password });
            console.log("Login success", result);
            // No need to navigate here, AuthContext handles it
        } catch (err) {
            setError('Login failed');
            console.log('Login failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-indigo-50">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
                {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full mb-4 p-2 border rounded"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full mb-6 p-2 border rounded"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-pink-600 text-white py-2 rounded font-semibold hover:bg-pink-700 transition"
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <div className="mt-4 text-center">
                    <a href="/forgot-password" className="text-blue-600 hover:underline text-sm">Forgot password?</a>
                </div>
                <div className="mt-2 text-center text-sm">
                    Don't have an account? <a href="/register" className="text-pink-600 hover:underline">Register</a>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;
