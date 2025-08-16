import express from 'express';
import request from 'supertest';
import { body, validationResult } from 'express-validator';

// Create a minimal test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  
  // Test validation middleware
  const validate = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
    (req: any, res: any, next: any) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          errors: errors.array().map((err: any) => ({
            param: err.param,
            msg: err.msg,
            location: 'body'
          }))
        });
      }
      next();
    }
  ];

  // Test route
  app.post('/test', ...validate, (req, res) => {
    res.status(200).json({ message: 'Validation passed' });
  });

  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Test app error:', err);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  return app;
};

describe('Minimal Auth Test', () => {
  it('should return 400 for invalid input', async () => {
    const app = createTestApp();
    
    const response = await request(app)
      .post('/test')
      .set('Accept', 'application/json')
      .send({
        email: 'invalid-email',
        password: '123',
        name: '',
      });

    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('errors');
    expect(Array.isArray(response.body.errors)).toBe(true);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});
