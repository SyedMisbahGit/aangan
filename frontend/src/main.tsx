import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App';
import './index.css';
import { register } from './utils/serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import env from './config/env';

// Create root and render the app
const container = document.getElementById('root');

if (!container) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register service worker for PWA in production
if (env.IS_PRODUCTION && 'serviceWorker' in navigator) {
  // Register service worker with configuration
  register({
    onSuccess: (registration) => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
      // Check for updates every hour
      const updateInterval = setInterval(() => {
        registration.update().catch(err => {
          console.log('Service worker update check failed:', err);
        });
      }, 60 * 60 * 1000); // 1 hour
      
      // Cleanup interval on unload
      return () => clearInterval(updateInterval);
    },
    onUpdate: () => {
      console.log('New content is available; please refresh.');
      // You can add a UI notification here to inform the user to refresh
      if (window.confirm('A new version is available! Would you like to update now?')) {
        window.location.reload();
      }
    },
  });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
if (env.IS_DEVELOPMENT) {
  reportWebVitals(console.log);
} else {
  reportWebVitals();
}
