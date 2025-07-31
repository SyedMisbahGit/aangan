import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Container, Typography, Box, Paper } from '@mui/material';
import { ReportProblem as ReportProblemIcon } from '@mui/icons-material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // You can also log to your error tracking service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Optionally reload the app or navigate to home
    // window.location.href = '/';
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback: Fallback } = this.props;

    if (hasError) {
      // If a custom fallback is provided, use it
      if (Fallback) {
        return <Fallback error={error} errorInfo={errorInfo} onReset={this.handleReset} />;
      }

      // Default error UI
      return (
        <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ color: 'error.main', mb: 2 }}>
              <ReportProblemIcon sx={{ fontSize: 60 }} />
            </Box>
            <Typography variant="h4" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" paragraph>
              We're sorry, but an unexpected error occurred. Our team has been notified.
            </Typography>
            
            {process.env.NODE_ENV === 'development' && (
              <Box 
                sx={{ 
                  mt: 3, 
                  p: 2, 
                  textAlign: 'left', 
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Error details:
                </Typography>
                <pre style={{ margin: 0 }}>
                  {error && error.toString()}
                  {errorInfo && errorInfo.componentStack}
                </pre>
              </Box>
            )}
            
            <Box sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={this.handleReset}
                sx={{ mr: 2 }}
              >
                Try again
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => window.location.href = '/'}
              >
                Go to home
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
};

export default ErrorBoundary;
