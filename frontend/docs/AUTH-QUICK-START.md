# Authentication Quick Start

This guide will help you quickly integrate the Aangan authentication system into your application.

## Prerequisites

- Node.js 16+ and npm
- React 18+
- TypeScript 4.4+
- React Router 6+

## Installation

1. Install required dependencies:

```bash
npm install @zxcvbn-ts/core @zxcvbn-ts/language-common react-icons
```

2. Copy the authentication components to your project:

```
src/
  components/
    auth/
      AuthLayout.tsx
      ChangePassword.tsx
      ForgotPassword.tsx
      LoginForm.tsx
      PasswordStrengthMeter.tsx
      ProtectedRoute.tsx
      RegisterForm.tsx
      ResetPassword.tsx
      UserProfile.tsx
      VerifyEmail.tsx
      index.ts
  contexts/
    AuthContext.helpers.ts
    AuthContext.tsx
    AuthContext.types.ts
  routes/
    AuthRoutes.tsx
```

## Basic Setup

1. Wrap your app with the `AuthProvider`:

```tsx
// src/App.tsx
import { AuthProvider } from './contexts/AuthContext.helpers';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
```

2. Set up authentication routes:

```tsx
// src/AppContent.tsx
import { Routes, Route } from 'react-router-dom';
import AuthRoutes from './routes/AuthRoutes';
import { ProtectedRoute } from './components/auth';

function AppContent() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      
      {/* Authentication routes */}
      <Route path="/auth/*" element={<AuthRoutes />} />
      
      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

## Usage Examples

### 1. Login Form

```tsx
import { LoginForm } from './components/auth';

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
        <LoginForm 
          onSuccess={() => navigate('/dashboard')}
          showSocialLogin={true}
        />
      </div>
    </div>
  );
}
```

### 2. Protected Route

```tsx
import { ProtectedRoute } from './components/auth';

function Dashboard() {
  return (
    <ProtectedRoute requireAuth={true} requireVerified={true}>
      <div>
        <h1>Dashboard</h1>
        {/* Dashboard content */}
      </div>
    </ProtectedRoute>
  );
}
```

### 3. User Profile

```tsx
import { UserProfile } from './components/auth';
import { useAuth } from './contexts/AuthContext.helpers';

function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  
  const handleUpdate = async (updates) => {
    try {
      await updateProfile(updates);
      // Show success message
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <UserProfile 
        user={user}
        onUpdate={handleUpdate}
        onLogout={logout}
      />
    </div>
  );
}
```

## Environment Variables

Create a `.env` file in your project root:

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_FACEBOOK_APP_ID=your-facebook-app-id
REACT_APP_APPLE_CLIENT_ID=your-apple-client-id
```

## Testing

Run the test suite:

```bash
npm test
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your backend allows requests from your frontend domain
   - Check if credentials are being sent with requests

2. **Token Issues**
   - Verify token expiration time
   - Ensure proper token storage and retrieval

3. **Social Login**
   - Verify OAuth client IDs are correctly configured
   - Check redirect URIs in your OAuth provider settings

## Next Steps

- [Authentication System Documentation](./AUTHENTICATION.md)
- [Component Reference](./AUTH-COMPONENTS.md)
- [API Integration Guide](./API-INTEGRATION.md)
