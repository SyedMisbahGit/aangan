import React, { Component, ErrorInfo, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../../lib/errorUtils";
import ErrorPage from "./ErrorPage";
import { logger } from "../../utils/logger";

interface Props {
  children: ReactNode;
  narratorLine?: string;
  componentName?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
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
    const { componentName, onError } = this.props;
    const errorMessage = getErrorMessage(error);
    const errorContext = {
      error: errorMessage,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      componentName,
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      timestamp: new Date().toISOString(),
    };

    // Log error with context
    logger.error('Error boundary caught error', errorContext);
    
    // Call custom error handler if provided
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (e) {
        logger.error('Error in error handler', { error: e });
      }
    }
    
    // Log error to analytics/error tracking service
    if (typeof window !== 'undefined') {
      const errorPayload = {
        ...errorContext,
        userAgent: navigator.userAgent,
        // Add any additional context that might be useful
        state: this.state,
        props: {
          ...this.props,
          children: undefined, // Remove children to prevent potential circular references
        },
      };

      // Use sendBeacon for more reliable error reporting
      const blob = new Blob([JSON.stringify(errorPayload)], { type: 'application/json' });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/logs/error', blob);
      } else {
        // Fallback to fetch if sendBeacon is not available
        fetch('/api/logs/error', {
          method: 'POST',
          body: blob,
          keepalive: true, // Keep the request alive even if the page is being unloaded
          headers: { 'Content-Type': 'application/json' },
        }).catch((e) => {
          logger.error('Failed to send error to server', { error: e.message });
        });
      }
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    // Add retry analytics if needed
    logger.info('User clicked retry after error', {
      component: this.props.componentName,
      path: window.location.pathname,
    });
  };

  private handleGoHome = () => {
    if (this.props.navigate) {
      this.props.navigate("/");
      this.setState({ hasError: false, error: undefined });
      // Add navigation analytics if needed
      logger.info('User navigated home after error', {
        component: this.props.componentName,
        fromPath: window.location.pathname,
      });
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          title="The winds have paused"
          message={this.props.narratorLine || "A gentle hush has settled over the courtyard. Your whispers rest safely in the dusk. Try again, or let the silence hold you for a moment."}
          narratorLine={this.props.narratorLine || "Even the stars sometimes lose their way. The courtyard is listening, softly."}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          showHome={true}
          showReport={true}
          errorDetails={this.state.error ? this.state.error.message : undefined}
        />
      );
    }
    return this.props.children;
  }
}

// Wrapper component to provide navigation and enhanced error handling
const ErrorBoundaryWithNavigation: React.FC<Omit<Props, 'navigate'>> = (props) => {
  const navigate = useNavigate();
  
  // Global error handler for uncaught errors
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      logger.error('Uncaught error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('Unhandled promise rejection', {
        reason: event.reason?.message || 'Unknown reason',
        stack: event.reason?.stack,
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return <ErrorBoundary {...props} navigate={navigate} />;
};

export default ErrorBoundaryWithNavigation; 