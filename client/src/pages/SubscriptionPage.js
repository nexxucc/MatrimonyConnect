import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ExclamationCircleIcon } from '@heroicons/react/outline';

const plans = [
    {
        name: 'Free',
        price: 0,
        features: [
            'Basic search',
            'Send/receive interests',
            'Profile creation',
        ],
    },
    {
        name: 'Premium',
        price: 499,
        features: [
            'All Free features',
            'Chat with matches',
            'See who viewed your profile',
            'Priority support',
        ],
    },
];

const SubscriptionPage = () => {
    const queryClient = useQueryClient();
    const { data, isLoading, error } = useQuery({
        queryKey: ['my-user'],
        queryFn: () => paymentAPI.get('/auth/me'),
    });
    const mutation = useMutation({
        mutationFn: (plan) => paymentAPI.post('/payments/subscribe', { plan }),
        onSuccess: () => {
            queryClient.invalidateQueries(['my-user']);
            alert('Subscription updated!');
        },
    });

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div className="p-8 text-center text-red-600">Failed to load subscription info.</div>;
    const user = data;
    const currentPlan = user?.subscription?.plan || 'free';

    const handleSubscribe = async (plan) => {
        const amount = plan === 'premium' ? 499 : 0;
        if (amount === 0) {
            mutation.mutate('free');
            return;
        }
        if (!window.confirm('Proceed with dummy payment for ₹' + amount + '?')) return;
        // Create dummy order
        const { data: order } = await paymentAPI.post('/payments/create-order', { amount });
        // Simulate payment verification
        await paymentAPI.post('/payments/verify', {
            plan: 'premium',
            amount: order.amount / 100
        });
        queryClient.invalidateQueries(['my-user']);
        alert('Subscription updated!');
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
            <div className="flex items-center mb-4 bg-yellow-50 border border-yellow-200 rounded px-3 py-2 text-yellow-800 text-sm">
                <ExclamationCircleIcon className="h-5 w-5 mr-2 text-yellow-500" />
                Payments are simulated for demo purposes. No real money is involved.
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Subscription Plans</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                    <div key={plan.name} className={`rounded-lg border shadow-sm p-6 ${currentPlan === plan.name.toLowerCase() ? 'border-blue-600' : 'border-gray-200'}`}>
                        <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
                        <div className="text-3xl font-bold mb-4">{plan.price === 0 ? 'Free' : `₹${plan.price}`}</div>
                        <ul className="mb-4 space-y-1 text-gray-700">
                            {plan.features.map((f, i) => <li key={i}>• {f}</li>)}
                        </ul>
                        {currentPlan === plan.name.toLowerCase() ? (
                            <div className="text-green-600 font-semibold">Current Plan</div>
                        ) : (
                            <button
                                onClick={() => handleSubscribe(plan.name.toLowerCase())}
                                className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                                disabled={mutation.isLoading}
                            >
                                {mutation.isLoading ? 'Processing...' : 'Subscribe'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SubscriptionPage; 