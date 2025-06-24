import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    loading: true,
    isAuthenticated: false,
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return {
                ...state,
                loading: true,
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
            };
        case 'UPDATE_USER':
            return {
                ...state,
                user: { ...state.user, ...action.payload },
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: action.payload,
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const navigate = useNavigate();

    // Set auth token in axios headers
    useEffect(() => {
        if (state.token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }, [state.token]);    // Check if user is authenticated on app load
    useEffect(() => {
        const checkAuth = async () => {
            if (state.token) {
                try {
                    const response = await api.get('/auth/me');
                    dispatch({
                        type: 'LOGIN_SUCCESS',
                        payload: {
                            user: response.data.user,
                            token: state.token,
                        },
                    });
                } catch (error) {
                    console.error('Auth check failed:', error);
                    // Only remove token if it's a 401 error
                    if (error.response && error.response.status === 401) {
                        localStorage.removeItem('token');
                    }
                    dispatch({ type: 'LOGIN_FAILURE' });
                }
            } else {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };

        // Add a small delay to prevent race conditions
        const timer = setTimeout(() => {
            checkAuth();
        }, 100);

        return () => clearTimeout(timer);
    }, [state.token]); const login = async (credentials) => {
        dispatch({ type: 'LOGIN_START' });

        try {
            const response = await api.post('/auth/login', credentials);
            const { user, token } = response.data;

            localStorage.setItem('token', token);

            // Verify that the token works by making a test request
            try {
                await api.get('/auth/me');

                dispatch({
                    type: 'LOGIN_SUCCESS',
                    payload: { user, token },
                });

                toast.success('Login successful!');
            } catch (verifyError) {
                console.error('Token verification failed:', verifyError);
                localStorage.removeItem('token');
                dispatch({ type: 'LOGIN_FAILURE' });
                toast.error('Authentication failed. Please try again.');
            }
            navigate('/dashboard');

            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            dispatch({ type: 'LOGIN_FAILURE' });
            return { success: false, error: message };
        }
    }; const register = async (userData) => {
        dispatch({ type: 'LOGIN_START' });

        try {
            const response = await api.post('/auth/register', userData);
            const { user, token } = response.data;

            localStorage.setItem('token', token);

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user, token },
            });

            toast.success('Registration successful! Please verify your account.');
            navigate('/verify', { state: { email: userData.email, phone: userData.phone } });

            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            dispatch({ type: 'LOGIN_FAILURE' });
            return { success: false, error: message };
        }
    }; const verifyOTP = async (otpData) => {
        try {
            const response = await api.post('/auth/verify-otp', otpData);
            const { user } = response.data;

            dispatch({
                type: 'UPDATE_USER',
                payload: user,
            });

            toast.success('Account verified successfully!');
            // Don't navigate here - let the component handle navigation
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'OTP verification failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const forgotPassword = async (email) => {
        try {
            await api.post('/auth/forgot-password', { email });
            toast.success('Password reset email sent!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send reset email';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const resetPassword = async (token, password) => {
        try {
            await api.post('/auth/reset-password', { token, password });
            toast.success('Password reset successful!');
            navigate('/login');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Password reset failed';
            toast.error(message);
            return { success: false, error: message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
        toast.success('Logged out successfully');
        navigate('/');
    };

    const updateUser = (userData) => {
        dispatch({
            type: 'UPDATE_USER',
            payload: userData,
        });
    };

    const isAdmin = () => {
        return state.user?.role === 'admin';
    };

    const isPremium = () => {
        return state.user?.subscription?.isActive || state.user?.role === 'admin';
    };

    const value = {
        user: state.user,
        token: state.token,
        loading: state.loading,
        isAuthenticated: state.isAuthenticated,
        login,
        register,
        verifyOTP,
        forgotPassword,
        resetPassword,
        logout,
        updateUser,
        isAdmin,
        isPremium,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 