import { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Wrapper component to use hooks with class component
const ErrorBoundaryWrapper = ({ children, fallback }: Props) => {
  const navigate = useNavigate();
  
  return (
    <ErrorBoundary 
      fallback={fallback}
      onReset={() => navigate('/')}
    >
      {children}
    </ErrorBoundary>
  );
};

class ErrorBoundary extends Component<Props & { onReset: () => void }, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset();
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div style={{ padding: '24px' }}>
          <Result
            status="error"
            title="Something went wrong"
            subTitle={
              this.state.error ? 
              `Error: ${this.state.error.message}` : 
              'An unexpected error occurred.'
            }
            extra={[
              <Button 
                type="primary" 
                key="home"
                icon={<HomeOutlined />}
                onClick={this.handleReset}
              >
                Back to Home
              </Button>,
              <Button 
                key="retry" 
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            ]}
          />
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details style={{ marginTop: '20px', whiteSpace: 'pre-wrap' }}>
              <summary>Error Details</summary>
              <pre style={{ color: 'red' }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundaryWrapper;
