import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from './contexts/AuthContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import ServerStatusChecker from './components/common/ServerStatusChecker';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import GuestRoute from './components/auth/GuestRoute';

// Page Components
import HomePageSimple from './pages/HomePageSimple';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import SearchPage from './pages/SearchPage';
import ProfileViewPage from './pages/ProfileViewPage';
import InterestsPage from './pages/InterestsPage';
import ChatPage from './pages/ChatPage';
import SubscriptionPage from './pages/SubscriptionPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminProfilesPage from './pages/admin/AdminProfilesPage';
import NotFoundPage from './pages/NotFoundPage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import VerificationChoicePage from './components/auth/VerificationChoicePage';

// Loading Component
import LoadingSpinner from './components/common/LoadingSpinner';
import LanguageSwitcher from './components/common/LanguageSwitcher';

function App() {
    const { loading } = useAuth();

    useEffect(() => {
        console.log('App component mounted, loading state:', loading);
    }, [loading]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <I18nextProvider i18n={i18n}>
            <LanguageSwitcher />
            <Helmet>
                <title>Matrimony Connect - Find Your Perfect Match</title>
                <meta name="description" content="Join thousands of people who found their life partner on Matrimony Connect. Secure, trusted, and personalized matchmaking platform." />
            </Helmet>            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePageSimple />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/success-stories" element={<SuccessStoriesPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />                {/* Public but special routes (like verification) */}
                <Route path="/verify" element={<VerificationChoicePage />} />

                {/* Guest Routes */}
                <Route element={<GuestRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                </Route>

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/profile/edit" element={<EditProfilePage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/profile/:id" element={<ProfileViewPage />} />
                        <Route path="/interests" element={<InterestsPage />} />
                        <Route path="/chat" element={<ChatPage />} />
                        <Route path="/subscription" element={<SubscriptionPage />} />
                    </Route>
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute requireAdmin />}>
                    <Route element={<Layout />}>
                        <Route path="/admin" element={<AdminDashboardPage />} />
                        <Route path="/admin/users" element={<AdminUsersPage />} />
                        <Route path="/admin/profiles" element={<AdminProfilesPage />} />
                        <Route path="/admin/payments" element={<AdminPaymentsPage />} />
                        <Route path="/admin/reports" element={<AdminReportsPage />} />
                    </Route>
                </Route>

                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />            </Routes>
            <ServerStatusChecker />
        </I18nextProvider>
    );
}

export default App;