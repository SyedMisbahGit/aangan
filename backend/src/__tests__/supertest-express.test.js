// Test using supertest with Express
import { test, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';

// Create a minimal Express app
const createApp = () => {
  const app = express();
  app.get('/test', (req, res) => {
    res.json({ success: true });
  });
  return app;
};

test('should test supertest with Express', async () => {
  const app = createApp();
  const server = app.listen(0); // Random available port
  
  try {
    const response = await request(server)
      .get('/test')
      .expect(200);
    
    expect(response.body).toEqual({ success: true });
  } finally {
    server.close();
  }
});
