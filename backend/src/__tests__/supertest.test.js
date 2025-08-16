// Minimal test using supertest
import { test, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';

// Create a minimal HTTP server
const createTestServer = () => {
  const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
  });
  
  return new Promise((resolve) => {
    server.listen(0, () => {
      const address = server.address();
      const baseUrl = `http://localhost:${address.port}`;
      resolve({ server, baseUrl });
    });
  });
};

test('should test supertest', async () => {
  const { server, baseUrl } = await createTestServer();
  
  try {
    const response = await fetch(baseUrl);
    const data = await response.json();
    expect(data).toEqual({ success: true });
  } finally {
    server.close();
  }
});
