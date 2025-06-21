import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    verifyOTP: (otpData) => api.post('/auth/verify-otp', otpData),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    getMe: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
};

// Profile API
export const profileAPI = {
    getProfile: () => api.get('/profiles/me'),
    updateProfile: (data) => api.post('/profiles', data),
    getProfileById: (id) => api.get(`/profiles/${id}`),
    uploadPhoto: (formData) => api.post('/profiles/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    setPrimaryPhoto: (photoIndex) => api.put(`/profiles/photos/${photoIndex}/primary`),
    deletePhoto: (photoIndex) => api.delete(`/profiles/photos/${photoIndex}`),
    updatePreferences: (data) => api.put('/profiles/preferences', data),
    updatePrivacy: (data) => api.put('/profiles/privacy', data),
};

// Search API
export const searchAPI = {
    searchProfiles: (params) => api.get('/search', { params }),
    getDailyMatches: () => api.get('/search/daily-matches'),
    getSimilarProfiles: (profileId) => api.get(`/search/similar/${profileId}`),
    getFilters: () => api.get('/search/filters'),
};

// Interests API
export const interestsAPI = {
    sendInterest: (data) => api.post('/interests', data),
    getReceivedInterests: (params) => api.get('/interests/received', { params }),
    getSentInterests: (params) => api.get('/interests/sent', { params }),
    respondToInterest: (interestId, data) => api.put(`/interests/${interestId}/respond`, data),
    withdrawInterest: (interestId) => api.put(`/interests/${interestId}/withdraw`),
    markAsRead: (interestId) => api.put(`/interests/${interestId}/read`),
    getStats: () => api.get('/interests/stats'),
};

// Chat API
export const chatAPI = {
    getChats: () => api.get('/chat'),
    getChatMessages: (chatId) => api.get(`/chat/${chatId}`),
    sendMessage: (chatId, data) => api.post(`/chat/${chatId}/messages`, data),
    createChat: (data) => api.post('/chat', data),
};

// Payment API
export const paymentAPI = {
    createPaymentIntent: (data) => api.post('/payments/create-payment-intent', data),
    confirmPayment: (data) => api.post('/payments/confirm', data),
    getPaymentHistory: (params) => api.get('/payments/history', { params }),
    getSubscription: () => api.get('/payments/subscription'),
    cancelSubscription: () => api.post('/payments/cancel'),
};

// Admin API
export const adminAPI = {
    getDashboardStats: () => api.get('/admin/dashboard'),
    getUsers: (params) => api.get('/admin/users', { params }),
    getPendingProfiles: (params) => api.get('/admin/profiles/pending', { params }),
    approveProfile: (profileId, data) => api.put(`/admin/profiles/${profileId}/approve`, data),
    approvePhoto: (profileId, photoIndex, data) => api.put(`/admin/profiles/${profileId}/photos/${photoIndex}/approve`, data),
    updateUserRole: (userId, data) => api.put(`/admin/users/${userId}/role`, data),
    updateUserStatus: (userId, data) => api.put(`/admin/users/${userId}/status`, data),
    getPaymentAnalytics: (params) => api.get('/admin/payments/analytics', { params }),
    getInterestAnalytics: (params) => api.get('/admin/interests/analytics', { params }),
};

// User API
export const userAPI = {
    updateProfile: (data) => api.put('/users/profile', data),
    changePassword: (data) => api.put('/users/password', data),
    deleteAccount: () => api.delete('/users/account'),
    getStats: () => api.get('/users/stats'),
};

export default api; 