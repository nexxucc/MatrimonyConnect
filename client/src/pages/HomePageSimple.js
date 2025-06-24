import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const HomePageSimple = () => {
    useEffect(() => {
        console.log('Simple HomePage component mounted');
    }, []);

    return (
        <>
            <Helmet>
                <title>Matrimony Connect - Find Your Perfect Match</title>
                <meta name="description" content="Join thousands of people who found their life partner on Matrimony Connect. Secure, trusted, and personalized matchmaking platform." />
            </Helmet>

            <div className="min-h-screen bg-pink-100">
                <div className="container mx-auto px-4 py-28">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-pink-700">
                            Begin Your Journey to Finding "The One"
                        </h1>

                        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-700">
                            Join millions of people who found their perfect life partner on Matrimony Connect.
                        </p>

                        <div className="flex justify-center">
                            <Link
                                to="/register"
                                className="bg-pink-500 text-white px-8 py-4 rounded-full font-semibold shadow-lg"
                            >
                                Start Your Search
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HomePageSimple;
