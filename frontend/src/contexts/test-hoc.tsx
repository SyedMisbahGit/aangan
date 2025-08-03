import React from 'react';

// Define the auth context type
type AuthContextType = {
  isAuthenticated: boolean;
  // Add other auth context properties as needed
};

// Define the props that will be injected by the HOC
type WithAuthProps = {
  auth: AuthContextType;
};

// A minimal implementation of the withAuth HOC
export function withAuth<ComponentProps extends object>(
  Component: React.ComponentType<ComponentProps & WithAuthProps>
) {
  // Define the props type for the HOC by omitting the 'auth' prop from ComponentProps
  type HOCProps = Omit<ComponentProps, 'auth'>;
  
  // Define the HOC component
  const WithAuth: React.FC<HOCProps> = (props) => {
    // In a real implementation, this would come from the auth context
    const auth: AuthContextType = { isAuthenticated: false };
    
    // Create a new props object with the auth prop added
    const componentProps = { ...props, auth } as ComponentProps;
    return <Component {...componentProps} />;
  };
  
  // Set the displayName for better debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WithAuth.displayName = `WithAuth(${displayName})`;
  
  return WithAuth;
}

// Example usage of the HOC
interface MyComponentProps {
  someProp: string;
  auth: AuthContextType; // This will be injected by the HOC
}

const MyComponent: React.FC<MyComponentProps> = ({ someProp, auth }) => {
  return (
    <div>
      <p>Some prop: {someProp}</p>
      <p>Is authenticated: {auth.isAuthenticated ? 'Yes' : 'No'}</p>
    </div>
  );
};

export const MyWrappedComponent = withAuth(MyComponent);
