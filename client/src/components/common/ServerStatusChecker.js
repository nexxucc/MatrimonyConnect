import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ServerStatusChecker = () => {
    const [serverStatus, setServerStatus] = useState('checking');
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkServerStatus = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/health', {
                    timeout: 5000,
                    withCredentials: true
                });
                if (response.data && response.data.status === 'OK') {
                    setServerStatus('online');
                } else {
                    setServerStatus('error');
                    setError('Unexpected response from server');
                }
            } catch (err) {
                setServerStatus('offline');
                setError(err.message || 'Could not connect to the server');
                console.error('Server connection error:', err);
            }
        };

        checkServerStatus();
    }, []);

    if (serverStatus === 'checking') {
        return null;
    }

    if (serverStatus === 'online') {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md">
            <strong className="font-bold">Server Offline! </strong>
            <span className="block sm:inline">{error}</span>
            <p className="text-sm mt-1">Please make sure the server is running at http://localhost:5000</p>
        </div>
    );
};

export default ServerStatusChecker;
