import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/store/authStore';
import Layout from '@/components/layout/Layout';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';

// Public pages
import HomePage from '@/pages/HomePage';
import ServicesPage from '@/pages/ServicesPage';
import PricingPage from '@/pages/PricingPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';

// Dashboard pages
import DashboardHome from '@/pages/dashboard/DashboardHome';
import ProfilePage from '@/pages/dashboard/ProfilePage';
import BillingPage from '@/pages/dashboard/BillingPage';
import LibraryPage from '@/pages/dashboard/LibraryPage';
import GeneratePage from '@/pages/dashboard/GeneratePage';

// Payment pages
import MockPaymentWidget from '@/components/payment/MockPaymentWidget';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';

// Service pages
import AstroScopePage from '@/pages/services/AstroScopePage';
import TarotPathPage from '@/pages/services/TarotPathPage';
import ZodiacTomePage from '@/pages/services/ZodiacTomePage';

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, initialized } = useAuth();
  
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gradient-cosmic flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading AstroLuna...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public route wrapper (redirect to dashboard if logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const App: React.FC = () => {
  const { initializeAuth, initialized } = useAuth();
  
  useEffect(() => {
    if (!initialized) {
      initializeAuth();
    }
  }, [initialized, initializeAuth]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Pages */}
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        
        {/* Service Pages */}
        <Route path="services/astroscope" element={<AstroScopePage />} />
        <Route path="services/tarotpath" element={<TarotPathPage />} />
        <Route path="services/zodiactome" element={<ZodiacTomePage />} />
        
        {/* Auth Pages */}
        <Route path="login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />
        <Route path="forgot-password" element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        } />
        <Route path="reset-password" element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        } />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        
        {/* Payment Widget & Success Pages */}
        <Route path="widget" element={<MockPaymentWidget />} />
        <Route path="billing/success" element={<PaymentSuccessPage />} />
        <Route path="billing/token-success" element={<PaymentSuccessPage />} />
        
        {/* Dashboard Pages */}
        <Route path="dashboard" element={
          <ProtectedRoute>
            <DashboardHome />
          </ProtectedRoute>
        } />
        <Route path="dashboard/generate" element={
          <ProtectedRoute>
            <GeneratePage />
          </ProtectedRoute>
        } />
        <Route path="dashboard/library" element={
          <ProtectedRoute>
            <LibraryPage />
          </ProtectedRoute>
        } />
        <Route path="dashboard/billing" element={
          <ProtectedRoute>
            <BillingPage />
          </ProtectedRoute>
        } />
        <Route path="dashboard/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;