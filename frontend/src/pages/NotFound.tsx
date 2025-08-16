import { useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Button } from "../components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Log 404 errors in development or if an error tracking service is available
    if (process.env.NODE_ENV === 'development') {
      // Only log in development
       
      console.error(
        "404 Error: User attempted to access non-existent route:",
        location.pathname,
      );
    }
    
    // In production, you might want to send this to an error tracking service
    // e.g., Sentry.captureMessage(`404: ${location.pathname}`);
    
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, [location.pathname]);

  return (
    <main
      ref={mainRef}
      role="main"
      aria-labelledby="page-title"
      tabIndex={-1}
      className="min-h-screen flex items-center justify-center bg-gray-100"
    >
      <div className="text-center">
        <h1 id="page-title" className="sr-only">Page not found</h1>
        <div className="text-4xl font-bold mb-4">404</div>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/">
          <Button className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition">
            Return to Home
          </Button>
        </a>
      </div>
    </main>
  );
};

export default NotFound;
