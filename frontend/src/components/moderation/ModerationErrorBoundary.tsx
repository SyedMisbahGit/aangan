import React, { ReactNode } from 'react';
import { Result, Button, Card, ResultProps } from 'antd';
import { WarningOutlined, ReloadOutlined } from '@ant-design/icons';
import ErrorBoundary from '../common/ErrorBoundary';

export interface ModerationErrorBoundaryProps {
  /** The content to be wrapped by the error boundary */
  children: ReactNode;
  /** Name of the component for error messages */
  componentName?: string;
  /** Custom error message to display */
  errorMessage?: string;
  /** Callback function when retry is clicked */
  onRetry?: () => void;
  /** Additional CSS class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

const DEFAULT_ERROR_MESSAGE = 'An error occurred while loading the content. Please try again or contact support if the issue persists.';

export const ModerationErrorBoundary: React.FC<ModerationErrorBoundaryProps> = ({
  children,
  componentName = 'Moderation Component',
  errorMessage = DEFAULT_ERROR_MESSAGE,
  onRetry,
  className = '',
  style = {},
  ...restProps
}) => {
  const handleRetry = () => {
    if (onRetry && typeof onRetry === 'function') {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const fallback = (
    <Card 
      className={`moderation-error-boundary ${className}`}
      style={{
        margin: '16px auto',
        maxWidth: '800px',
        ...style
      }}
      {...restProps}
    >
      <Result
        status="warning"
        title={`Error in ${componentName}`}
        subTitle={errorMessage}
        icon={<WarningOutlined style={{ color: '#faad14' }} />}
        extra={[
          <Button 
            type="primary" 
            key="retry"
            icon={<ReloadOutlined />}
            onClick={handleRetry}
          >
            Retry
          </Button>
        ]}
      />
    </Card>
  );

  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
};

// Type for the error boundary state
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// Type for the error boundary props
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// Enhanced ErrorBoundary component
class EnhancedErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log the error to an error reporting service
    console.error('Error caught by error boundary:', error, errorInfo);
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default ModerationErrorBoundary;
