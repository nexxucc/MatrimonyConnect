import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart, Shield, Users, Star, ArrowRight, Check } from 'lucide-react';

const HomePage = () => {
    const features = [
        {
            icon: Shield,
            title: 'Secure & Trusted',
            description: 'Your privacy and security are our top priorities with verified profiles and secure communication.'
        },
        {
            icon: Users,
            title: 'Verified Profiles',
            description: 'All profiles are manually verified by our team to ensure authenticity and quality matches.'
        },
        {
            icon: Heart,
            title: 'Smart Matching',
            description: 'Advanced algorithms help you find compatible matches based on your preferences and values.'
        },
        {
            icon: Star,
            title: 'Premium Experience',
            description: 'Enjoy premium features like unlimited messaging, advanced search, and priority support.'
        }
    ];

    const testimonials = [
        {
            name: 'Priya & Rahul',
            location: 'Mumbai',
            text: 'We found each other on Matrimony Connect and got married within 6 months. Thank you for helping us find our perfect match!',
            rating: 5
        },
        {
            name: 'Anjali & Vikram',
            location: 'Delhi',
            text: 'The platform made it so easy to connect with like-minded people. We are grateful for this wonderful journey.',
            rating: 5
        },
        {
            name: 'Meera & Arjun',
            location: 'Bangalore',
            text: 'Matrimony Connect helped us find our soulmate. The verification process gave us confidence in the platform.',
            rating: 5
        }
    ];

    return (
        <>
            <Helmet>
                <title>Matrimony Connect - Find Your Perfect Match</title>
                <meta name="description" content="Join thousands of people who found their life partner on Matrimony Connect. Secure, trusted, and personalized matchmaking platform." />
            </Helmet>

            <div className="min-h-screen">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-pink-600 via-purple-600 to-pink-800 text-white">
                    <div className="absolute inset-0 bg-black opacity-20"></div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                        <div className="text-center">
                            <h1 className="text-4xl md:text-6xl font-bold mb-6">
                                Find Your Perfect
                                <span className="block text-yellow-300">Life Partner</span>
                            </h1>
                            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                                Join thousands of people who found their soulmate on Matrimony Connect.
                                Secure, trusted, and personalized matchmaking platform.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/register"
                                    className="bg-white text-pink-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                                >
                                    Get Started Free
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-pink-600 transition-colors"
                                >
                                    Already a Member?
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Why Choose Matrimony Connect?
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                We provide a comprehensive platform designed to help you find your perfect match
                                with advanced features and security measures.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 text-pink-600 rounded-full mb-4">
                                            <Icon className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-600">
                                            {feature.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Success Stories
                            </h2>
                            <p className="text-xl text-gray-600">
                                Hear from couples who found their perfect match on our platform
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                                    <div className="flex items-center mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                        ))}
                                    </div>
                                    <p className="text-gray-600 mb-4 italic">
                                        "{testimonial.text}"
                                    </p>
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="ml-3">
                                            <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                            <p className="text-sm text-gray-500">{testimonial.location}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 bg-pink-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to Find Your Perfect Match?
                        </h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto">
                            Join thousands of people who have already found their life partner on Matrimony Connect.
                        </p>
                        <Link
                            to="/register"
                            className="bg-white text-pink-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
                        >
                            Start Your Journey Today
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="text-xl font-bold mb-4">Matrimony Connect</h3>
                                <p className="text-gray-400">
                                    Helping people find their perfect life partner with trust, security, and personalized matchmaking.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Quick Links</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                                    <li><Link to="/how-it-works" className="hover:text-white">How It Works</Link></li>
                                    <li><Link to="/success-stories" className="hover:text-white">Success Stories</Link></li>
                                    <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Support</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                                    <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                                    <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                                    <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Contact Info</h4>
                                <ul className="space-y-2 text-gray-400">
                                    <li>Email: support@matrimonyconnect.com</li>
                                    <li>Phone: +1 (555) 123-4567</li>
                                    <li>Address: 123 Matrimony St, City, State</li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                            <p>&copy; 2024 Matrimony Connect. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default HomePage; 