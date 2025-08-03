import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import AanganLoadingScreen from '../components/shared/AanganLoadingScreen';
import { useAuth } from '../contexts/AuthContext.helpers';

// Lazy load auth components for better performance
const LoginForm = lazy(() => import('../components/auth/LoginForm'));
const RegisterForm = lazy(() => import('../components/auth/RegisterForm'));
const ForgotPassword = lazy(() => import('../components/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../components/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('../components/auth/VerifyEmail'));
const UserProfile = lazy(() => import('../components/auth/UserProfile'));
const ChangePassword = lazy(() => import('../components/auth/ChangePassword'));

/**
 * A wrapper component that renders auth routes with a consistent layout.
 * This component handles all authentication-related routes.
 */
const AuthRoutes: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // If user is already authenticated, redirect to the home page or the page they were trying to access
  if (isAuthenticated && !['/verify-email', '/change-password'].includes(location.pathname)) {
    return <Navigate to={from} replace state={{ from: location }} />;
  }

  return (
    <Suspense fallback={<AanganLoadingScreen />}>
      <Routes>
        {/* Login Route */}
        <Route
          path="/login"
          element={
            <AuthLayout 
              title="Sign in to your account"
              subtitle="Or start your 14-day free trial"
              footerText="Don't have an account?"
              footerLinkText="Sign up"
              footerLinkTo="/register"
            >
              <LoginForm />
            </AuthLayout>
          }
        />
        
        {/* Register Route */}
        <Route
          path="/register"
          element={
            <AuthLayout 
              title="Create your account"
              subtitle="Join our community today"
              showBackButton
              backText="Back to home"
              footerText="Already have an account?"
              footerLinkText="Sign in"
              footerLinkTo="/login"
            >
              <RegisterForm />
            </AuthLayout>
          }
        />
        
        {/* Forgot Password Route */}
        <Route
          path="/forgot-password"
          element={
            <AuthLayout 
              title="Forgot your password?"
              subtitle="We'll send you a link to reset it"
              showBackButton
              backText="Back to login"
              backTo="/login"
              footerText="Remember your password?"
              footerLinkText="Sign in"
              footerLinkTo="/login"
            >
              <ForgotPassword />
            </AuthLayout>
          }
        />
        
        {/* Reset Password Route */}
        <Route
          path="/reset-password"
          element={
            <AuthLayout 
              title="Reset your password"
              subtitle="Create a new password for your account"
              showBackButton
              backText="Back to login"
              backTo="/login"
            >
              <ResetPassword />
            </AuthLayout>
          }
        />
        
        {/* Verify Email Route */}
        <Route
          path="/verify-email"
          element={
            <AuthLayout 
              title="Verify your email"
              subtitle="We've sent a verification link to your email"
              showBackButton
              backText="Back to home"
            >
              <VerifyEmail />
            </AuthLayout>
          }
        />
        
        {/* User Profile Route (Protected) */}
        <Route
          path="/profile"
          element={
            <AuthLayout 
              title="Your Profile"
              showBackButton
              backText="Back to app"
              className="max-w-4xl"
            >
              <UserProfile />
            </AuthLayout>
          }
        />
        
        {/* Change Password Route (Protected) */}
        <Route
          path="/change-password"
          element={
            <AuthLayout 
              title="Change Password"
              showBackButton
              backText="Back to profile"
              backTo="/profile"
            >
              <ChangePassword />
            </AuthLayout>
          }
        />
        
        {/* Catch-all route for unknown auth paths */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AuthRoutes;
