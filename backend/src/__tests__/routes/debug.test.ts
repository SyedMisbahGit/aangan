import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { describe, it, expect, vi } from 'vitest';
import { validationResult, body } from 'express-validator';
import { BadRequestError } from '../../utils/errors.js';

// Mock the validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    next(new BadRequestError('Validation failed', 'VALIDATION_ERROR', errors.array()));
  };
};

describe('Debug Test', () => {
  it('should test validation middleware directly', async () => {
    const req = {
      body: {
        email: 'invalid-email',
        password: '123',
        name: ''
      }
    };
    
    const res = {};
    const next = vi.fn();
    
    // Run the validation
    await validate([
      body('email').isEmail().withMessage('Invalid email'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
      body('name').notEmpty().withMessage('Name is required')
    ])(req, res, next);
    
    // Check if next was called with an error
    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(BadRequestError);
    expect(error.message).toBe('Validation failed');
  });

  it('should test validation in an Express app', async () => {
    const app = express();
    app.use(bodyParser.json());
    
    app.post('/test', [
      body('email').isEmail().withMessage('Invalid email'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
      body('name').notEmpty().withMessage('Name is required')
    ], (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors.array()
        });
      }
      res.status(200).json({ success: true });
    });

    // Test with invalid input
    const response = await request(app)
      .post('/test')
      .send({
        email: 'invalid-email',
        password: '123',
        name: ''
      });
    
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Validation failed');
    expect(response.body.details).toBeDefined();
    expect(response.body.details.length).toBeGreaterThan(0);
  });
});
