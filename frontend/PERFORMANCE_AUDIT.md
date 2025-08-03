# Performance Audit: Aangan Frontend

## Checklist

- [ ] Bundle size is analyzed and optimized
- [ ] Code splitting is used for large modules/pages
- [ ] Images are optimized (WebP, AVIF, responsive sizes)
- [ ] Critical CSS is inlined or loaded early
- [ ] Unused CSS and JS are removed
- [ ] Service worker caches assets efficiently
- [ ] Lighthouse performance score is above 90
- [ ] No render-blocking resources
- [ ] Lazy loading is used for offscreen images/components

## Summary

- Use Vite’s analyzer to monitor bundle size
- Use React.lazy and Suspense for code splitting
- Optimize images and static assets
- Run Lighthouse regularly and address flagged issues

---
*Update this file after each performance review or audit.* 