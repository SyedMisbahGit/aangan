# Authentication Components Reference

This document provides detailed documentation for each authentication component in the College Whisper application.

## Table of Contents
1. [ProtectedRoute](#protectedroute)
2. [LoginForm](#loginform)
3. [RegisterForm](#registerform)
4. [ForgotPassword](#forgotpassword)
5. [ResetPassword](#resetpassword)
6. [VerifyEmail](#verifyemail)
7. [UserProfile](#userprofile)
8. [ChangePassword](#changepassword)
9. [AuthLayout](#authlayout)
10. [AuthRoutes](#authroutes)

## ProtectedRoute

### Description
A higher-order component that protects routes based on authentication status.

### Props
- `children`: The component to render if authenticated
- `requireAuth`: Whether authentication is required (default: true)
- `requireVerified`: Whether email verification is required (default: false)
- `requireAdmin`: Whether admin role is required (default: false)
- `redirectTo`: Path to redirect if not authenticated (default: '/auth/login')

### Usage
```tsx
<ProtectedRoute requireAuth={true} requireVerified={true}>
  <Dashboard />
</ProtectedRoute>
```

## LoginForm

### Description
Handles user authentication with email/password and social login options.

### Props
- `onSuccess`: Callback on successful login
- `onError`: Callback when login fails
- `initialEmail`: Pre-filled email
- `showSocialLogin`: Toggle social login buttons (default: true)
- `showSignUpLink`: Toggle sign-up link (default: true)
- `showForgotPassword`: Toggle forgot password link (default: true)

### Usage
```tsx
<LoginForm 
  onSuccess={() => navigate('/dashboard')}
  initialEmail={prefilledEmail}
/>
```

## RegisterForm

### Description
Handles new user registration with validation and password strength checking.

### Props
- `onSuccess`: Callback on successful registration
- `onError`: Callback when registration fails
- `requireEmailVerification`: Whether to require email verification (default: true)
- `minPasswordStrength`: Minimum password strength (0-4, default: 2)

### Usage
```tsx
<RegisterForm 
  onSuccess={(user) => navigate('/verify-email')}
  minPasswordStrength={3}
/>
```

## ForgotPassword

### Description
Handles password reset requests.

### Props
- `onSuccess`: Callback on successful request
- `onError`: Callback when request fails
- `emailPlaceholder`: Custom placeholder for email field

### Usage
```tsx
<ForgotPassword 
  onSuccess={() => showToast('Reset email sent')}
  emailPlaceholder="Enter your college email"
/>
```

## ResetPassword

### Description
Handles password reset with token validation.

### Props
- `token`: Reset token from URL
- `onSuccess`: Callback on successful reset
- `onError`: Callback when reset fails
- `minPasswordStrength`: Minimum password strength (0-4, default: 2)

### Usage
```tsx
<ResetPassword 
  token={resetToken}
  onSuccess={() => navigate('/login')}
/>
```

## VerifyEmail

### Description
Handles email verification flow.

### Props
- `token`: Verification token from URL
- `onSuccess`: Callback on successful verification
- `onError`: Callback when verification fails
- `onResend`: Callback when resend is requested

### Usage
```tsx
<VerifyEmail 
  token={verificationToken}
  onSuccess={() => navigate('/dashboard')}
  onResend={(email) => resendVerificationEmail(email)}
/>
```

## UserProfile

### Description
Displays and manages user profile information.

### Props
- `user`: Current user object
- `onUpdate`: Callback when profile is updated
- `onLogout`: Callback when user logs out
- `onDeleteAccount`: Callback when account is deleted

### Usage
```tsx
<UserProfile 
  user={currentUser}
  onUpdate={(updates) => updateProfile(updates)}
  onLogout={handleLogout}
/>
```

## ChangePassword

### Description
Handles password change for authenticated users.

### Props
- `onSuccess`: Callback on successful password change
- `onError`: Callback when password change fails
- `requireCurrentPassword`: Whether to require current password (default: true)
- `minPasswordStrength`: Minimum password strength (0-4, default: 2)

### Usage
```tsx
<ChangePassword 
  onSuccess={() => showToast('Password updated')}
  requireCurrentPassword={true}
/>
```

## AuthLayout

### Description
Provides a consistent layout for authentication pages.

### Props
- `title`: Page title
- `subtitle`: Optional subtitle
- `showBackButton`: Show/hide back button
- `backTo`: Custom back button target
- `footerText`: Footer text
- `footerLinkText`: Footer link text
- `footerLinkTo`: Footer link target

### Usage
```tsx
<AuthLayout 
  title="Reset Password"
  subtitle="Enter your new password"
  showBackButton
  backTo="/login"
>
  {/* Form content */}
</AuthLayout>
```

## AuthRoutes

### Description
Centralized routing configuration for authentication flows.

### Routes
- `/auth/login` - User login
- `/auth/register` - User registration
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - Password reset form
- `/auth/verify-email` - Email verification
- `/auth/profile` - User profile
- `/auth/change-password` - Change password

### Usage
```tsx
<Routes>
  {/* Other routes */}
  <Route path="/auth/*" element={<AuthRoutes />} />
</Routes>
```

## Best Practices

1. **Form Handling**
   - Use controlled components for form inputs
   - Implement proper validation
   - Provide clear error messages

2. **Error Handling**
   - Handle API errors gracefully
   - Show user-friendly error messages
   - Log errors for debugging

3. **Accessibility**
   - Use semantic HTML
   - Add proper ARIA attributes
   - Ensure keyboard navigation

4. **Performance**
   - Lazy load components
   - Optimize re-renders
   - Use proper loading states
