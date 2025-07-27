import request from 'supertest';
import { app } from '../app';
import { db } from '../db';

describe('API Endpoints', () => {
  let testUser: any;
  let authToken: string;

  beforeAll(async () => {
    // Run migrations and seed test data
    await db.migrate.latest();
    
    // Create a test user
    [testUser] = await db('users')
      .insert({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: '$2a$10$XFDq3s7X5q5J5X5X5X5X5u5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X5X', // 'password' hashed
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .returning('*');

    // Login to get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password'
      });
    
    authToken = response.body.token;
  });

  afterAll(async () => {
    // Clean up test data
    await db('whispers').del();
    await db('users').where({ id: testUser.id }).del();
    await db.destroy();
  });

  describe('Authentication', () => {
    it('should authenticate with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should not authenticate with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('Whispers API', () => {
    let testWhisper: any;

    beforeEach(async () => {
      // Create a test whisper before each test
      [testWhisper] = await db('whispers')
        .insert({
          user_id: testUser.id,
          content: 'Test whisper content',
          is_anonymous: true,
          created_at: new Date().toISOString()
        })
        .returning('*');
    });

    afterEach(async () => {
      // Clean up test whispers
      await db('whispers').del();
    });

    it('should create a new whisper', async () => {
      const response = await request(app)
        .post('/api/whispers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'New test whisper',
          isAnonymous: true
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.content).toBe('New test whisper');
      expect(response.body.is_anonymous).toBe(true);
    });

    it('should get a list of whispers', async () => {
      const response = await request(app)
        .get('/api/whispers')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('content');
    });

    it('should get a single whisper by ID', async () => {
      const response = await request(app)
        .get(`/api/whispers/${testWhisper.id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testWhisper.id);
      expect(response.body.content).toBe('Test whisper content');
    });

    it('should delete a whisper', async () => {
      const response = await request(app)
        .delete(`/api/whispers/${testWhisper.id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Verify the whisper was deleted
      const whisper = await db('whispers').where({ id: testWhisper.id }).first();
      expect(whisper).toBeUndefined();
    });
  });
});
