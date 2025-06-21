import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

const ContactPage = () => {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        // Here you would send the message to the backend
    };

    return (
        <>
            <Helmet>
                <title>Contact - Matrimony Connect</title>
            </Helmet>
            <div className="max-w-3xl mx-auto py-12 px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Get in Touch</h2>
                        {submitted ? (
                            <div className="bg-green-100 text-green-800 p-4 rounded mb-6">Thank you for contacting us! We will get back to you soon.</div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input type="text" name="name" value={form.name} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input type="email" name="email" value={form.email} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Message</label>
                                    <textarea name="message" value={form.message} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md" rows={4} required />
                                </div>
                                <button type="submit" className="w-full py-2 px-4 bg-pink-600 text-white rounded hover:bg-pink-700 font-semibold">Send Message</button>
                            </form>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Contact Info</h2>
                        <p className="text-gray-700 mb-2">Email: support@matrimonyconnect.com</p>
                        <p className="text-gray-700 mb-2">Phone: +91 98765 43210</p>
                        <p className="text-gray-700 mb-6">Address: 123, Main Street, Mumbai, India</p>
                        <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center text-gray-500">Map Placeholder</div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContactPage; 