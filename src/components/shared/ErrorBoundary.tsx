import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackMessage?: string;
  narratorLine?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Optionally log error to an error reporting service
    // console.error(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Optionally reload the page or navigate home
    // window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-cream-100 dark:bg-dream-dark-bg text-inkwell dark:text-dream-dark-text font-poetic text-lg animate-fade-in relative overflow-hidden p-8">
          {/* Floating Orbs Animation */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-1/4 left-1/3 w-24 h-24 bg-dream-accent/30 rounded-full blur-2xl animate-float-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-dream-secondary/20 rounded-full blur-2xl animate-float-medium" />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-4">
            <span className="text-3xl font-bold">Something went adrift...</span>
            <span className="italic opacity-80" aria-live="polite">
              {this.props.narratorLine || 'A gentle hush falls over the campus. Please try again or return home.'}
            </span>
            <pre className="text-xs bg-white/60 dark:bg-dream-dark-bg/60 rounded p-2 mt-2 max-w-md overflow-x-auto text-red-600 dark:text-red-300">
              {this.state.error?.message}
            </pre>
            <button
              onClick={this.handleReset}
              className="mt-4 px-6 py-2 rounded-lg bg-dream-accent text-white font-semibold shadow hover:bg-dream-accent/90 focus:outline-none focus:ring-2 focus:ring-dream-accent"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 