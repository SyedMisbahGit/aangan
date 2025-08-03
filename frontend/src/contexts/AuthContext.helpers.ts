import { createContext, useContext } from 'react';
import { AuthContextType } from './AuthContext.types';


/**
 * The AuthContext provides authentication state and methods throughout the app.
 * Use the useAuth() hook to access it in your components.
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);


/**
 * Custom hook to use the auth context.
 * Must be used within an AuthProvider.
 * * @returns The auth context
 * @throws {Error} If used outside of an AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


/**
 * Higher-Order Component that provides auth props to a component.
 * * @param Component - The component to wrap with auth props
 * @returns A new component with auth props injected
 */
// Define the prop types for components that use withAuth
type WithAuthProps = {
  auth: AuthContextType;
};


// A type-safe implementation of withAuth using a type assertion
export function withAuth<P extends WithAuthProps>(
  Component: React.ComponentType<P>
): React.FC<Omit<P, 'auth'>> {
  const WithAuth: React.FC<Omit<P, 'auth'>> = (props) => {
    const auth = useAuth();
    // We use a type assertion here as we know the combined props will be valid
    const componentProps = { ...props, auth } as unknown as P;
    return <Component {...componentProps} />;
  };

  const displayName = Component.displayName || Component.name || 'Component';
  WithAuth.displayName = `WithAuth(${displayName})`;

  return WithAuth;
}


/**
 * Type guard to check if a user is authenticated
 * * @param user - The user object to check
 * @returns True if the user is authenticated (not a guest and has a valid user object)
 */
export const isAuthenticated = (user: any): user is NonNullable<AuthContextType['user']> => {
  return !!user && !user.isGuest;
};


/**
 * Type guard to check if a user has a specific role
 * * @param user - The user object to check
 * @param role - The role to check for
 * @returns True if the user has the specified role
 */
export const hasRole = (
  user: AuthContextType['user'], 
  role: NonNullable<AuthContextType['user']>['role']
): boolean => {
  return !!user && !user.isGuest && user.role === role;
};