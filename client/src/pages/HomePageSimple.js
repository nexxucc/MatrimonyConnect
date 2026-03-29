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
                <title>Matrimony Connect - Trusted Matchmaking</title>
                <meta name="description" content="A matchmaking platform built on trust, verification, and real connections. Browse profiles, send interests, and find your partner." />
            </Helmet>

            <div className="min-h-screen bg-pink-100">
                <div className="container mx-auto px-4 py-28">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-pink-700">
                            Find Someone Worth the Wait
                        </h1>

                        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-700">
                            Thousands of families have found the right match on Matrimony Connect.
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
