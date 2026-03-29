import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const HomePage = () => {
    useEffect(() => {
        console.log('HomePage component mounted');
    }, []);

    const features = [
        {
            icon: Shield,
            title: 'Secure & Trusted',
            description: 'Every profile goes through checks, and your conversations stay private. We take that seriously.'
        },
        {
            icon: Users,
            title: 'Verified Profiles',
            description: 'Our team reviews each profile by hand. No bots, no fakes — just real people looking for a partner.'
        },
        {
            icon: Heart,
            title: 'Smart Matching',
            description: 'We suggest people based on what actually matters to you — religion, location, values, education, and more.'
        },
        {
            icon: Star,
            title: 'Premium Experience',
            description: 'Unlock messaging, detailed search filters, and priority support when you upgrade.'
        }
    ];

    const testimonials = [
        {
            name: 'Priya & Rahul',
            location: 'Mumbai',
            text: 'We matched on Matrimony Connect and were married six months later. Honestly didn\'t think it would happen this fast.',
            rating: 5
        },
        {
            name: 'Anjali & Vikram',
            location: 'Delhi',
            text: 'It was easy to find people who shared our values. We talked for a while, the families met, and it all just clicked.',
            rating: 5
        },
        {
            name: 'Meera & Arjun',
            location: 'Bangalore',
            text: 'What sold us was the verification process. You actually feel safe talking to people on here. That made all the difference.',
            rating: 5
        }
    ];

    return (
        <>
            <Helmet>
                <title>Matrimony Connect - Trusted Matchmaking</title>
                <meta name="description" content="A matchmaking platform built on trust, verification, and real connections. Browse profiles, send interests, and find your partner." />
            </Helmet>

            <div className="min-h-screen">                {/* Hero Section */}
                <section className="relative overflow-hidden">                    {/* Background with overlay */}
                    <div className="absolute inset-0 bg-cover bg-center bg-pink-100" style={{
                        backgroundColor: "#fce7f3", // Fallback color
                        filter: "blur(2px)"
                    }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/80 via-pink-800/80 to-pink-900/80"></div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-20 left-10 w-32 h-32 bg-pink-400 rounded-full opacity-20 blur-xl"></div>
                    <div className="absolute bottom-10 right-10 w-56 h-56 bg-purple-500 rounded-full opacity-20 blur-2xl"></div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-36">
                        <div className="text-center">
                            <div className="inline-block mb-4">
                                <div className="flex items-center justify-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-white text-sm">
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path>
                                    </svg>
                                    <span>Thousands of couples matched</span>
                                </div>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">                                Find Someone{' '}
                                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
                                    Worth the Wait
                                </span>
                            </h1>

                            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/90">                                Thousands of families have found the right match here.{' '}
                                <span className="block mt-2 text-yellow-200 font-light">Trusted by families across India and abroad</span>
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/register"
                                    className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-8 py-4 rounded-full font-semibold hover:from-pink-600 hover:to-rose-700 transition shadow-lg hover:shadow-pink-500/30 inline-flex items-center justify-center group"
                                >
                                    Get Started
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    to="/login"
                                    className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-colors"
                                >
                                    Already have an account?
                                </Link>
                            </div>

                            <div className="mt-12 flex items-center justify-center space-x-8 text-white/75">
                                <div className="flex flex-col items-center">
                                    <span className="text-2xl font-bold text-white">5M+</span>
                                    <span className="text-sm">Members</span>
                                </div>
                                <div className="h-12 w-px bg-white/20"></div>
                                <div className="flex flex-col items-center">
                                    <span className="text-2xl font-bold text-white">1M+</span>
                                    <span className="text-sm">Matches Made</span>
                                </div>
                                <div className="h-12 w-px bg-white/20"></div>
                                <div className="flex flex-col items-center">
                                    <span className="text-2xl font-bold text-white">190+</span>
                                    <span className="text-sm">Countries</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>                {/* Features Section */}
                <section className="py-20 bg-white relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-pink-50 rounded-full"></div>
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-50 rounded-full"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="text-center mb-16">
                            <span className="text-pink-600 font-medium text-sm uppercase tracking-wider">Features & Benefits</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
                                Why People Choose Us
                            </h2>
                            <div className="h-1 w-24 bg-gradient-to-r from-pink-500 to-rose-500 mx-auto my-4 rounded-full"></div>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                We combine traditional matchmaking values with modern tools so you can find
                                someone who's genuinely compatible.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">                            {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={`feature-${feature.title}`} className="relative bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                                    <div className="absolute top-0 right-0 -mt-4 mr-4 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 text-pink-600 rounded-xl mb-6 group-hover:bg-pink-600 group-hover:text-white transition-colors">
                                        <Icon className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                        </div>

                        <div className="mt-16 text-center">
                            <div className="inline-block rounded-lg bg-pink-50 p-4">
                                <div className="flex items-center space-x-2 text-pink-700">
                                    <Check className="h-5 w-5" />
                                    <span className="text-sm font-medium">Family Approved</span>
                                    <span className="mx-2">•</span>
                                    <Check className="h-5 w-5" />
                                    <span className="text-sm font-medium">Background Verified</span>
                                    <span className="mx-2">•</span>
                                    <Check className="h-5 w-5" />
                                    <span className="text-sm font-medium">100% Privacy Focused</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>                {/* Success Stories Section */}
                <section className="py-20 bg-gradient-to-br from-pink-50 to-purple-50 relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-pink-200 opacity-50 blur-xl"></div>
                    <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-purple-200 opacity-50 blur-xl"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <div className="text-center mb-16">
                            <span className="text-pink-600 font-medium text-sm uppercase tracking-wider">Love Stories</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
                                Real People, Real Stories
                            </h2>
                            <div className="h-1 w-24 bg-gradient-to-r from-pink-500 to-rose-500 mx-auto my-4 rounded-full"></div>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Hear from couples who connected on Matrimony Connect
                                and decided to build a life together
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">                            {testimonials.map((testimonial) => (
                            <div key={`testimonial-${testimonial.name}`} className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 relative">
                                {/* Decorative quotation mark */}
                                <div className="absolute top-4 right-4 text-pink-100 font-serif text-6xl leading-none">"</div>

                                {/* Wedding rings icon */}
                                <div className="inline-block p-3 bg-pink-50 rounded-full mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8h-4a4 4 0 10-8 0H4" />
                                    </svg>
                                </div>

                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, idx) => (
                                        <Star key={`star-${id}-${idx}`} className="h-5 w-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>

                                <p className="text-gray-700 mb-6 italic relative z-10">
                                    "{testimonial.text}"
                                </p>

                                <div className="flex items-center mt-6 pt-4 border-t border-gray-100">
                                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="ml-4">
                                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                                            </svg>
                                            {testimonial.location}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>

                        <div className="mt-12 text-center">
                            <Link to="/success-stories" className="inline-flex items-center text-pink-600 font-medium hover:text-pink-700">
                                View More Success Stories
                                <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                </section>                {/* CTA Section */}
                <section className="py-20 relative overflow-hidden">
                    {/* Background with overlay */}
                    <div className="absolute inset-0 bg-cover bg-center" style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1529634597503-139d3726fed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80')",
                    }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/90 via-pink-700/90 to-pink-800/90"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl py-12 px-8 border border-white/20 shadow-xl max-w-4xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                                Ready to Take the First Step?
                            </h2>

                            <div className="h-1 w-24 bg-white mx-auto my-6 rounded-full"></div>

                            <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
                                Thousands of people have already found their partner through Matrimony Connect.
                                You could be next.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/register"
                                    className="bg-white text-pink-600 px-10 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center shadow-lg group"
                                >
                                    Create Your Profile Now
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Link>

                                <Link
                                    to="/how-it-works"
                                    className="text-white border border-white px-10 py-4 rounded-full font-semibold hover:bg-white/20 transition-colors inline-flex items-center justify-center"
                                >
                                    Learn How It Works
                                </Link>
                            </div>

                            <div className="mt-8 text-white/80 text-sm">
                                Connecting families in 190+ countries
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="text-xl font-bold mb-4">Matrimony Connect</h3>
                                <p className="text-gray-400">
                                    A trusted matchmaking platform where families and individuals find compatible partners with confidence.
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