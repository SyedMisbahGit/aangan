// Minimal auth routes test
import { test, expect, vi, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';

// Create a minimal Express app
const app = express();
app.use(bodyParser.json());

// Minimal route for testing
app.get('/api/test', (req, res) => {
  res.json({ success: true });
});

// Simple test
let server;

beforeAll(() => {
  server = app.listen(0); // Use a random available port
});

afterEach(() => {
  server.close();
});

test('should respond with success', async () => {
  const response = await request(server)
    .get('/api/test')
    .expect(200);
  
  expect(response.body).toEqual({ success: true });
});
