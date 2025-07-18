import React, { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "@/lib/errorUtils";

interface Props {
  children: ReactNode;
  narratorLine?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props & { navigate: (path: string) => void }, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", getErrorMessage(error), errorInfo);
    
    // Log error to analytics/error tracking service
    if (typeof window !== "undefined") {
      fetch("/api/logs/error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: getErrorMessage(error),
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // Silently fail if error logging fails
      });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleGoHome = () => {
    this.props.navigate("/");
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-aangan-background text-aangan-text-primary p-4">
          {/* Floating Orbs Animation */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-1/4 left-1/3 w-24 h-24 bg-aangan-accent/30 rounded-full blur-2xl animate-aangan-float" />
            <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-aangan-secondary/20 rounded-full blur-2xl animate-aangan-float" />
            <div className="absolute top-2/3 right-1/3 w-16 h-16 bg-aangan-primary/20 rounded-full blur-2xl animate-aangan-float" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="aangan-card p-8 max-w-md text-center relative z-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-aangan-anxiety/10 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <AlertTriangle className="w-8 h-8 text-aangan-anxiety" />
            </motion.div>

            <h1 className="text-2xl font-serif font-semibold text-aangan-text-primary mb-4">
              Oops! Something went adrift
            </h1>

            <p className="text-aangan-text-secondary mb-6 leading-relaxed">
              {this.props.narratorLine || "The courtyard encountered an unexpected moment. Don't worry, your whispers are safe."}
            </p>

            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-sm text-aangan-text-muted cursor-pointer hover:text-aangan-text-secondary">
                  Technical details
                </summary>
                <pre className="mt-2 text-xs text-aangan-text-muted bg-aangan-surface p-3 rounded-lg overflow-auto max-h-32">
                  {getErrorMessage(this.state.error)}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={this.handleRetry}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-aangan-primary text-white font-semibold rounded-lg shadow-aangan-lg hover:bg-aangan-primary/90 focus:outline-none focus:ring-2 focus:ring-aangan-primary"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-aangan-surface text-aangan-text-primary font-semibold rounded-lg border border-aangan-border hover:bg-aangan-card transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </motion.button>
            </div>

            <p className="text-xs text-aangan-text-muted mt-6 italic">
              If this keeps happening, please let us know
            </p>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to provide navigation
const ErrorBoundaryWithNavigation: React.FC<Props> = (props) => {
  const navigate = useNavigate();
  return <ErrorBoundary {...props} navigate={navigate} />;
};

export default ErrorBoundaryWithNavigation; 