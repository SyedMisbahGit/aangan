import request from 'supertest';
import { app } from '../../../src/app.js';
import { testDb } from '../test-db.js';
import { 
  createTestUser, 
  getAuthToken, 
  getTestUser, 
  initTestDatabase, 
  cleanupTestData 
} from '../test-utils.js';

describe('User Profile API', () => {
  let testUser;
  let authToken;
  let adminUser;
  let adminToken;

  beforeAll(async () => {
    // Initialize test database with schema and test data
    await initTestDatabase();
    
    // Get test users
    const userData = getTestUser('user');
    const adminData = getTestUser('admin');
    
    // Create test users in the database
    testUser = await createTestUser(userData);
    adminUser = await createTestUser(adminData);
    
    // Get auth tokens
    authToken = await getAuthToken(userData.email, userData.password);
    adminToken = await getAuthToken(adminData.email, adminData.password);
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
    // Close the database connection
    await testDb.destroy();
  });

  describe('GET /api/user/profile', () => {
    it('should return 401 if no token is provided', async () => {
      const response = await request(app).get('/api/user/profile');
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 if token is invalid', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer invalidtoken');
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return user profile for authenticated user', async () => {
      const userData = getTestUser('user');
      
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        email: userData.email,
        username: userData.username,
        role: userData.role
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('lastLogin');
    });
  });

  describe('PUT /api/user/profile', () => {
    it('should update user profile with valid data', async () => {
      const updatedData = {
        username: 'updateduser',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);
      
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        username: 'updateduser',
        email: 'updated@example.com',
        role: 'user' // Should not change
      });
      
      // Verify the update in the database
      const user = await testDb('users').where({ id: testUser.id }).first();
      expect(user).toMatchObject({
        username: 'updateduser',
        email: 'updated@example.com',
        role: 'user' // Should not change
      });
    });

    it('should return 400 if no fields to update', async () => {
      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'No fields to update');
    });

    it('should return 400 for duplicate email', async () => {
      const adminData = getTestUser('admin');
      
      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: adminData.email });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Email already in use');
    });
    
    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'invalid-email' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/admin/users', () => {
    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    it('should return paginated list of users for admin', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.pagination).toMatchObject({
        total: expect.any(Number),
        page: 1,
        limit: 20,
        pages: expect.any(Number)
      });
      
      // Should contain our test users
      const usernames = response.body.users.map(u => u.username);
      expect(usernames).toContain('testuser');
      expect(usernames).toContain('admin');
    });

    it('should filter users by search query', async () => {
      // First, create another test user for searching
      await createTestUser({
        email: 'another.user@example.com',
        username: 'anotheruser',
        password: 'testpass123',
        role: 'user'
      });
      
      // Search for 'test' should find 'testuser' but not 'anotheruser'
      const response = await request(app)
        .get('/api/admin/users?search=test')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      const usernames = response.body.users.map(u => u.username);
      expect(usernames).toContain('testuser');
      expect(usernames).not.toContain('anotheruser');
    });
    
    it('should filter users by role', async () => {
      const response = await request(app)
        .get('/api/admin/users?role=admin')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.users.every(u => u.role === 'admin')).toBe(true);
      expect(response.body.users.some(u => u.username === 'admin')).toBe(true);
    });
    
    it('should respect pagination parameters', async () => {
      // Create enough test users to test pagination
      for (let i = 0; i < 15; i++) {
        await createTestUser({
          email: `user${i}@example.com`,
          username: `user${i}`,
          password: 'testpass123',
          role: 'user'
        });
      }
      
      // Get first page with 5 items
      const page1 = await request(app)
        .get('/api/admin/users?limit=5&page=1')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(page1.status).toBe(200);
      expect(page1.body.users).toHaveLength(5);
      expect(page1.body.pagination).toMatchObject({
        page: 1,
        limit: 5,
        total: expect.any(Number),
        pages: Math.ceil((page1.body.pagination.total) / 5)
      });
      
      // Get second page
      const page2 = await request(app)
        .get('/api/admin/users?limit=5&page=2')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(page2.status).toBe(200);
      expect(page2.body.users).toHaveLength(5);
      
      // Ensure pages return different users
      const page1Ids = page1.body.users.map(u => u.id);
      const page2Ids = page2.body.users.map(u => u.id);
      
      const intersection = page1Ids.filter(id => page2Ids.includes(id));
      expect(intersection).toHaveLength(0);
    });
  });
});
