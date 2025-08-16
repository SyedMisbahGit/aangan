import db from '../db.js';
import { Knex } from 'knex';

describe('Database', () => {
  beforeAll(async () => {
    // Run migrations
    await db.migrate.latest();
  });

  afterAll(async () => {
    // Close the database connection
    await db.destroy();
  });

  describe('Migrations', () => {
    it('should have run migrations successfully', async () => {
      const hasUsersTable = await db.schema.hasTable('users');
      const hasWhispersTable = await db.schema.hasTable('whispers');
      
      expect(hasUsersTable).toBe(true);
      expect(hasWhispersTable).toBe(true);
    });
  });

  describe('Database Operations', () => {
    beforeEach(async () => {
      // Clear test data before each test
      await db('whispers').del();
      await db('users').del();
    });

    it('should insert and retrieve a user', async () => {
      const [userId] = await db('users').insert({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).returning('id');

      const user = await db('users').where({ id: userId }).first();
      
      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
    });

    it('should insert and retrieve a whisper', async () => {
      const [userId] = await db('users').insert({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).returning('id');

      const [whisperId] = await db('whispers').insert({
        user_id: userId,
        content: 'Test whisper content',
        is_anonymous: true,
        created_at: new Date().toISOString()
      }).returning('id');

      const whisper = await db('whispers').where({ id: whisperId }).first();
      
      expect(whisper).toBeDefined();
      expect(whisper.content).toBe('Test whisper content');
      expect(whisper.is_anonymous).toBe(1); // SQLite uses 1 for true
      expect(whisper.user_id).toBe(userId);
    });
  });
});
