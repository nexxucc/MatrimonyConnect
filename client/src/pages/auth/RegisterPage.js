import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { countries } from '../../components/auth/countries';

const RegisterPage = () => {
    const [form, setForm] = useState({ name: '', email: '', phone: '', gender: '', password: '', confirmPassword: '' });
    const [countryCode, setCountryCode] = useState('+91');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Register form submitted:', form);
        setError('');
        setSuccess('');
        if (!form.gender) {
            setError('Please select your gender');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            console.log('About to call API with:', form);
            const response = await authAPI.register({ ...form, phone: countryCode + form.phone });
            console.log('Registration API response:', response);
            setSuccess('Registration successful! Please verify your account.');
            navigate('/verify', { state: { email: form.email, phone: countryCode + form.phone } });
        } catch (err) {
            console.error('API call failed:', err);
            if (err && typeof err === 'object') {
                console.error('Error toJSON:', err.toJSON ? err.toJSON() : 'N/A');
                console.error('Error response:', err.response);
                console.error('Error message:', err.message);
                console.error('Error config:', err.config);
                if (err.response) {
                    console.error('Error response data:', err.response.data);
                    console.error('Error response status:', err.response.status);
                    console.error('Error response headers:', err.response.headers);
                }
            }
            let errorMsg = err.response?.data?.message || 'Registration failed';
            if (err.response?.data?.errors && Array.isArray(err.response.data.errors) && err.response.data.errors.length > 0) {
                errorMsg = err.response.data.errors[0].msg || errorMsg;
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-indigo-50">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
                {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}
                {success && <div className="mb-4 text-green-600 text-sm text-center">{success}</div>}
                <input type="text" name="name" placeholder="Full Name" className="w-full mb-4 p-2 border rounded" value={form.name} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" className="w-full mb-4 p-2 border rounded" value={form.email} onChange={handleChange} required />
                <div className="flex mb-4">
                    <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className="p-2 border rounded-l bg-gray-100">
                        {countries.map(c => (
                            <option key={c.key} value={c.code}>{c.name} ({c.code})</option>
                        ))}
                    </select>
                    <input type="tel" name="phone" placeholder="Phone" className="flex-1 p-2 border-t border-b border-r rounded-r" value={form.phone} onChange={handleChange} required />
                </div>
                <select name="gender" className="w-full mb-4 p-2 border rounded" value={form.gender} onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
                <input type="password" name="password" placeholder="Password" className="w-full mb-4 p-2 border rounded" value={form.password} onChange={handleChange} required />
                <input type="password" name="confirmPassword" placeholder="Confirm Password" className="w-full mb-6 p-2 border rounded" value={form.confirmPassword} onChange={handleChange} required />
                <button type="submit" className="w-full bg-pink-600 text-white py-2 rounded font-semibold hover:bg-pink-700 transition" disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
                <div className="mt-4 text-center text-sm">
                    Already have an account? <a href="/login" className="text-pink-600 hover:underline">Login</a>
                </div>
            </form>
        </div>
    );
};

export default RegisterPage;
