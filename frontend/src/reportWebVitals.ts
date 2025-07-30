type ReportHandler = (metric: any) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      // Use the available web-vitals v5.0.3 metrics
      try {
        onCLS(onPerfEntry);
        onFCP(onPerfEntry);
        onLCP(onPerfEntry);
        onTTFB(onPerfEntry);
        onINP(onPerfEntry);
      } catch (error) {
        console.error('Error tracking web vitals:', error);
      }
    }).catch((error) => {
      console.error('Error loading web-vitals:', error);
    });
  }
};

export default reportWebVitals;
