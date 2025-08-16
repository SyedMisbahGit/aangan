import request from 'supertest';
import express from 'express';
import { describe, it, expect } from 'vitest';

describe('Minimal Test', () => {
  it('should return 400 for invalid input', async () => {
    const app = express();
    app.use(express.json());
    
    app.post('/test', (req, res) => {
      res.status(400).json({ error: 'Test error' });
    });

    const response = await request(app)
      .post('/test')
      .send({ invalid: 'data' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});
