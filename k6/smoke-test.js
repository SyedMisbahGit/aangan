import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'],    // Less than 10% failed requests
  },
};

export default function () {
  const baseUrl = 'http://localhost:3000';
  
  // Test homepage
  const homeRes = http.get(`${baseUrl}/`);
  check(homeRes, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads within 1s': (r) => r.timings.duration < 1000,
  });

  // Test API endpoints
  const apiRes = http.get(`${baseUrl}/api/health`);
  check(apiRes, {
    'api status is 200': (r) => r.status === 200,
    'api response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(1);
}
