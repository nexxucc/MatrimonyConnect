import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

const RegisterPage = () => {
    const [form, setForm] = useState({ name: '', email: '', phone: '', gender: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
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
            await authAPI.post('/auth/register', form);
            setSuccess('Registration successful! Please login.');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
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
                <input type="tel" name="phone" placeholder="Phone" className="w-full mb-4 p-2 border rounded" value={form.phone} onChange={handleChange} required />
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
