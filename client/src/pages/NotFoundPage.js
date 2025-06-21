import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
    return (
        <>
            <Helmet>
                <title>Page Not Found - Matrimony Connect</title>
            </Helmet>

            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="mb-8">
                        <div className="text-6xl font-bold text-pink-600 mb-4">404</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Page Not Found
                        </h1>
                        <p className="text-gray-600">
                            Sorry, the page you're looking for doesn't exist or has been moved.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Link
                            to="/"
                            className="btn-primary inline-flex items-center"
                        >
                            <Home className="mr-2 h-5 w-5" />
                            Go to Homepage
                        </Link>

                        <button
                            onClick={() => window.history.back()}
                            className="btn-outline inline-flex items-center"
                        >
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default NotFoundPage; 