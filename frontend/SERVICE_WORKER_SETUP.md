# Service Worker Setup Guide

This guide provides instructions for setting up and troubleshooting service workers in the Aangan application.

## Service Workers in This Project

1. **Main Service Worker (`/sw.js`)**
   - Handles PWA functionality
   - Registered in `main.tsx`

2. **Firebase Messaging Service Worker (`/firebase-messaging-sw.js`)**
   - Handles push notifications
   - Registered by Firebase Messaging SDK

## Development Setup

1. **Local Development**
   - Service workers are only available in production builds or when served over HTTPS
   - For local testing, use:
     ```bash
     npm run dev -- --https
     ```
   - Or use a tool like `ngrok` to expose your local server with HTTPS

2. **Testing Service Workers**
   - Open Chrome DevTools > Application > Service Workers
   - Check "Update on reload" for easier development
   - Use "Clear storage" to unregister service workers when needed

## Deployment

1. **Vercel Configuration**
   - The `vercel.json` file is already configured to:
     - Serve service workers with the correct MIME type
     - Set proper cache headers
     - Allow service worker scope

2. **Required Environment Variables**
   - `VITE_REALTIME_URL`: WebSocket URL for real-time updates
   - `VITE_SOCKET_SHARED_KEY`: Shared key for WebSocket authentication
   - Firebase configuration is already set in the code

## Common Issues

1. **Service Worker Not Registering**
   - Ensure the app is served over HTTPS in production
   - Check browser console for errors
   - Verify the service worker file exists in the `public` directory

2. **MIME Type Errors**
   - The `vercel.json` file should handle this
   - If issues persist, check the network tab to verify the `Content-Type` header

3. **Push Notifications Not Working**
   - Verify Firebase configuration
   - Check browser console for permission errors
   - Ensure the VAPID key is correctly set in `firebase-messaging.ts`

## Updating Service Workers

1. To update the service worker:
   - Increment the version in the service worker file
   - The browser will automatically update the service worker when it detects changes
   - Use `self.skipWaiting()` and `clients.claim()` for immediate updates

## Testing in Production

1. After deployment:
   - Clear site data in browser
   - Open the app and check the console for service worker registration
   - Verify push notifications work

## Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
