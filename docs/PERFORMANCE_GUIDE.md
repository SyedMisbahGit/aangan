# ⚡ Performance Guide - Aangan Platform

## [2025-07] Audit-Driven Recommendations
- **Subcomponent State Handling:** All major subcomponents (feeds, charts, modals) must handle loading, error, and empty states for async data.
- **Virtualization:** Use virtualization (e.g., react-window) for any list or feed that may grow large (HomeFeed, admin analytics, etc.).
- **Data Fetching:** Use React Query or SWR for all async data fetching, with caching and background refetching.
- **Dark Mode:** All pages/components must be tested for dark mode compatibility.
- **Accessibility:** All modals, popovers, and charts must be tested with screen readers and keyboard navigation.
- **Error Pages:** Implement a custom /500 error page for server errors.
- **Dead-end Links:** Remove or hide links to unimplemented pages (e.g., /settings) until they exist.
- **API Integration:** Replace all demo/static data with real API calls in production.

---

## Overview
This document outlines performance optimization strategies implemented in the Aangan platform to ensure fast, responsive, and efficient user experience.

## 🎯 Performance Targets

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Bundle Size Targets
- **Initial Bundle**: < 500KB gzipped
- **Total Bundle**: < 2MB gzipped
- **Chunk Size**: < 250KB per chunk

## 🏗️ Build Optimizations

### 1. Vite Configuration
```typescript
// vite.config.ts optimizations
build: {
  target: 'es2015', // Broader browser support
  minify: 'terser', // Better minification
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        utils: ['axios', 'date-fns', 'clsx'],
      },
    },
  },
  chunkSizeWarningLimit: 1000,
}
```

### 2. Code Splitting
- **Route-based**: Lazy loading for pages
- **Component-based**: Heavy components loaded on demand
- **Vendor splitting**: Third-party libraries in separate chunks

### 3. Tree Shaking
- ES modules for better tree shaking
- Unused code elimination
- Dead code removal

## 📦 Bundle Optimization

### 1. Dependency Management
**Removed Unused Dependencies:**
- `@capacitor/*` - Mobile app dependencies (not used in web)
- `@supabase/supabase-js` - Replaced with custom auth
- `firebase-admin` - Backend-only dependency
- `compression` - Frontend doesn't need compression
- `node-fetch`, `nodemailer`, `sqlite3` - Backend-only

### 2. Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist

# Check for duplicate dependencies
npm ls
```

### 3. Image Optimization
- WebP format for better compression
- Responsive images with srcset
- Lazy loading for images
- Optimized icon sets

## 🚀 Runtime Performance

### 1. React Optimizations
```typescript
// Component memoization
const MemoizedComponent = React.memo(Component);

// Hook optimization
const useMemoizedValue = useMemo(() => expensiveCalculation(), [deps]);

// Callback optimization
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);
```

### 2. State Management
- Local state for component-specific data
- Context for shared state
- React Query for server state
- Optimistic updates for better UX

### 3. Rendering Optimization
- Virtual scrolling for large lists
- Pagination for data-heavy pages
- Debounced search inputs
- Throttled scroll handlers

## 🌐 Network Optimization

### 1. API Optimization
- Request caching with React Query
- Optimistic updates
- Background refetching
- Error boundaries for graceful failures

### 2. Service Worker
```javascript
// PWA caching strategy
runtimeCaching: [
  {
    urlPattern: /^https:\/\/aangan-production\.up\.railway\.app\/api/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'api-cache',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      },
    },
  },
]
```

### 3. CDN & Caching
- Static assets on CDN
- Browser caching headers
- Service worker caching
- API response caching

## 📱 Mobile Performance

### 1. Touch Optimization
- Touch-friendly button sizes (44px minimum)
- Swipe gestures for navigation
- Pull-to-refresh functionality
- Smooth scrolling

### 2. Battery Optimization
- Reduced animations on low battery
- Background sync optimization
- Efficient real-time connections
- Minimal background processing

### 3. Offline Support
- Service worker for offline functionality
- Cached essential resources
- Offline-first data strategy
- Graceful degradation

## 🔍 Performance Monitoring

### 1. Metrics Collection
```typescript
// Performance monitoring
const PerformanceMonitor = () => {
  useEffect(() => {
    // Core Web Vitals
    web_vitals.getCLS(console.log);
    web_vitals.getFID(console.log);
    web_vitals.getLCP(console.log);
  }, []);
};
```

### 2. Real-time Monitoring
- Connection quality monitoring
- Latency tracking
- Memory usage monitoring
- Battery level awareness

### 3. Error Tracking
- Performance error boundaries
- Network error handling
- Graceful fallbacks
- User feedback collection

## 🛠️ Development Performance

### 1. Development Tools
```bash
# Fast refresh for development
npm run dev

# Bundle analysis
npm run analyze

# Performance testing
npm run test:performance
```

### 2. Hot Module Replacement
- Fast refresh for React components
- CSS hot reloading
- Asset hot reloading
- State preservation

### 3. Debugging Tools
- React DevTools
- Performance profiler
- Network tab monitoring
- Lighthouse audits

## 📊 Performance Testing

### 1. Automated Testing
```bash
# Run performance tests
npm run test:performance

# Lighthouse CI
npm run lighthouse

# Bundle size testing
npm run test:bundlesize
```

### 2. Manual Testing
- [ ] Page load times < 3s
- [ ] Smooth scrolling (60fps)
- [ ] Responsive interactions
- [ ] Offline functionality
- [ ] Memory usage stable

### 3. Continuous Monitoring
- Lighthouse CI integration
- Bundle size tracking
- Performance regression testing
- Real user monitoring

## 🔧 Performance Tools

### 1. Build Tools
- **Vite**: Fast build tool
- **Terser**: JavaScript minification
- **PostCSS**: CSS optimization
- **Rollup**: Module bundling

### 2. Monitoring Tools
- **Lighthouse**: Performance auditing
- **Web Vitals**: Core metrics
- **React DevTools**: Component profiling
- **Network tab**: Request analysis

### 3. Testing Tools
- **Vitest**: Fast unit testing
- **Playwright**: E2E testing
- **Bundle analyzer**: Size analysis
- **Performance profiler**: Runtime analysis

## 📈 Performance Metrics

### 1. Key Metrics
- **Time to Interactive**: < 3.8s
- **Speed Index**: < 3.4s
- **Total Blocking Time**: < 300ms
- **First Contentful Paint**: < 1.8s

### 2. User Experience
- **Perceived Performance**: Fast and responsive
- **Smooth Animations**: 60fps
- **Quick Interactions**: < 100ms
- **Reliable Offline**: Seamless experience

### 3. Technical Metrics
- **Bundle Size**: Optimized chunks
- **Memory Usage**: Stable over time
- **Network Requests**: Minimized
- **Cache Hit Rate**: High percentage

---

*Last updated: January 2025*
*Maintained by: CUJ Community* 

# Performance Guide: Whispers Page Optimization

## Overview

The `/whispers` page has been optimized for both backend and frontend performance. This guide documents the key strategies and best practices now in place, and provides recommendations for future improvements.

---

## 1. Real Data Fetching with React Query
- The main whispers feed now fetches real data from the backend using the `useWhispers` React Query hook (`frontend/src/services/api.ts`).
- This enables caching, background refetching, and robust loading/error state management.

**Key file:** `frontend/src/pages/HomeFeed.tsx`

---

## 2. Pagination with "Load More"
- Whispers are fetched in batches (default: 20 at a time) using `limit` and `offset` parameters.
- A "Load More" button allows users to incrementally load more whispers, reducing initial load time and memory usage.
- The button is disabled and shows a loading state while fetching.

---

## 3. List Virtualization with react-window
- The main whispers list is virtualized using [`react-window`](https://react-window.vercel.app/), so only visible items are rendered in the DOM.
- This enables smooth scrolling and low memory usage, even with hundreds or thousands of whispers loaded.
- The `WhisperCard` component is memoized for further efficiency.

---

## 4. Best Practices for Future Contributors
- **Always use pagination or infinite scroll for large lists.**
- **Virtualize any list that could grow large.** Use `react-window` or similar libraries.
- **Use React Query (or SWR) for all data fetching.**
- **Memoize heavy components** (e.g., cards, rows) to avoid unnecessary re-renders.
- **Show loading and error states** for all async data.
- **Profile performance** with React Profiler if you notice slowdowns.
- **Consider dynamic import/lazy loading** for heavy components if bundle size becomes an issue.

---

## 5. Further Reading
- [React Query Documentation](https://tanstack.com/query/latest)
- [react-window Documentation](https://react-window.vercel.app/)
- [React Profiler](https://react.dev/reference/react/Profiler)

---

_Last updated: July 2025_ 