import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.helpers';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireVerifiedEmail?: boolean;
  redirectTo?: string;
}

/**
 * A component that protects routes based on authentication status and user roles.
 * 
 * @param children - The child components to render if the user is authorized
 * @param requireAdmin - If true, only allows admin users to access the route
 * @param requireVerifiedEmail - If true, only allows users with verified emails to access the route
 * @param redirectTo - The path to redirect to if the user is not authorized (default: '/login')
 * 
 * @example
 * // Basic protection - only authenticated users can access
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 * } />
 * 
 * @example
 * // Admin-only route
 * <Route path="/admin" element={
 *   <ProtectedRoute requireAdmin>
 *     <AdminDashboard />
 *   </ProtectedRoute>
 * } />
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireVerifiedEmail = false,
  redirectTo = '/login',
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show a loading indicator while checking auth status
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If admin is required but user is not an admin, redirect to home
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // If email verification is required but email is not verified, redirect to verification page
  if (requireVerifiedEmail && !user?.emailVerified) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  // If all checks pass, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
