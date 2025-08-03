import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backTo?: string;
  backText?: string;
  footerText?: string;
  footerLinkText?: string;
  footerLinkTo?: string;
  className?: string;
}

/**
 * A layout component for authentication-related pages (login, register, etc.)
 * Provides a consistent look and feel across all auth pages.
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  backTo = '/',
  backText = 'Back to home',
  footerText,
  footerLinkText,
  footerLinkTo,
  className = ''
}) => {
  const location = useLocation();
  
  // If backTo is not provided, try to get the previous path from location state
  const backPath = location.state?.from?.pathname || backTo;
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                Aangan
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/about" className="text-gray-500 hover:text-gray-700">
                About
              </Link>
              <Link to="/privacy" className="text-gray-500 hover:text-gray-700">
                Privacy
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-gray-700">
                Terms
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className={`w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md ${className}`}>
          {/* Back button */}
          {showBackButton && (
            <div className="mb-4">
              <Link 
                to={backPath} 
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                state={{ from: location.state?.from }}
              >
                <FaArrowLeft className="mr-1" />
                {backText}
              </Link>
            </div>
          )}
          
          {/* Auth header */}
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Auth content */}
          <div className="mt-8">
            {children}
          </div>
          
          {/* Auth footer */}
          {footerText && footerLinkText && footerLinkTo && (
            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">{footerText} </span>
              <Link 
                to={footerLinkTo} 
                className="font-medium text-blue-600 hover:text-blue-500"
                state={{ from: location.state?.from }}
              >
                {footerLinkText}
              </Link>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Aangan. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
