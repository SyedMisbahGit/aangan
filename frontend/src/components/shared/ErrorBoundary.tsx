import React, { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../../lib/errorUtils";
import ErrorPage from "./ErrorPage";
import { logger } from "../../utils/logger";

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
    const errorMessage = getErrorMessage(error);
    logger.error('Error boundary caught error', { 
      error: errorMessage,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: typeof window !== 'undefined' ? window.location.href : 'server',
    });
    
    // Log error to analytics/error tracking service
    if (typeof window !== "undefined") {
      fetch("/api/logs/error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: errorMessage,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      }).catch((e) => {
        logger.error('Failed to send error to server', { error: e.message });
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
        <ErrorPage
          title="The winds have paused"
          message={this.props.narratorLine || "A gentle hush has settled over the courtyard. Your whispers rest safely in the dusk. Try again, or let the silence hold you for a moment."}
          narratorLine={this.props.narratorLine || "Even the stars sometimes lose their way. The courtyard is listening, softly."}
          onRetry={this.handleRetry}
          showHome={true}
          showReport={true}
          errorDetails={this.state.error ? this.state.error.message : undefined}
        />
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