import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface LoadingState {
  isLoading: boolean;
  message?: string;
  key?: string;
}

interface LoadingContextType {
  /**
   * Current loading state
   */
  loadingState: LoadingState;
  /**
   * Show loading with an optional message
   */
  showLoading: (message?: string, key?: string) => void;
  /**
   * Hide loading indicator
   */
  hideLoading: (key?: string) => void;
  /**
   * Check if a specific loading key is active
   */
  isLoading: (key?: string) => boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
  /**
   * Default loading message
   * @default 'Loading...'
   */
  defaultMessage?: string;
}

/**
 * Provider component that adds loading state management to your app
 */
export function LoadingProvider({ 
  children, 
  defaultMessage = 'Loading...' 
}: LoadingProviderProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>({ 
    isLoading: false, 
    message: defaultMessage 
  });

  const showLoading = useCallback((message: string = defaultMessage, key?: string) => {
    setLoadingState({ isLoading: true, message, key });
  }, [defaultMessage]);

  const hideLoading = useCallback((key?: string) => {
    setLoadingState(prev => {
      // If a key is provided, only hide if the keys match or no key was set
      if (!key || !prev.key || prev.key === key) {
        return { ...prev, isLoading: false };
      }
      return prev;
    });
  }, []);

  const isLoading = useCallback((key?: string) => {
    return loadingState.isLoading && (!key || !loadingState.key || loadingState.key === key);
  }, [loadingState]);

  return (
    <LoadingContext.Provider 
      value={{ 
        loadingState, 
        showLoading, 
        hideLoading, 
        isLoading 
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

/**
 * Hook to access the loading context
 * @returns Loading context with loading state and control functions
 */
export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

/**
 * Higher-order component to provide loading context to class components
 */
export function withLoading(Component: React.ComponentType<any>) {
  return function WrappedComponent(props: any) {
    const loadingContext = useLoading();
    return <Component {...props} loadingContext={loadingContext} />;
  };
}

export default LoadingContext;
