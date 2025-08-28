import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { testDb } from './test-db.js';

// Test user credentials
const TEST_USERS = {
  user: {
    email: 'testuser@example.com',
    username: 'testuser',
    password: 'testpass123',
    role: 'user'
  },
  admin: {
    email: 'admin@example.com',
    username: 'admin',
    password: 'adminpass123',
    role: 'admin'
  }
};

/**
 * Create a test user in the database
 * @param {Object} userData - User data to create
 * @returns {Promise<Object>} Created user
 */
export async function createTestUser(userData) {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const [user] = await testDb('users')
    .insert({
      email: userData.email,
      username: userData.username,
      password: hashedPassword,
      role: userData.role || 'user',
      is_active: true,
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .returning('*');
  
  return user;
}

/**
 * Get an authentication token for a test user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<string>} JWT token
 */
export async function getAuthToken(email, password) {
  const user = await testDb('users').where({ email }).first();
  if (!user) throw new Error('User not found');
  
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid password');
  
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
}

/**
 * Get test user credentials
 * @param {string} role - User role ('user' or 'admin')
 * @returns {Object} Test user credentials
 */
export function getTestUser(role = 'user') {
  return { ...TEST_USERS[role] };
}

/**
 * Clean up test data from the database
 * @returns {Promise<void>}
 */
export async function cleanupTestData() {
  await testDb('users')
    .whereIn('email', Object.values(TEST_USERS).map(u => u.email))
    .del();
}

/**
 * Initialize test database with required schema and test data
 * @returns {Promise<void>}
 */
export async function initTestDatabase() {
  // Create the users table if it doesn't exist
  await testDb.schema.createTableIfNotExists('users', (table) => {
    table.increments('id').primary();
    table.string('email').unique().notNullable();
    table.string('username').unique().notNullable();
    table.string('password').notNullable();
    table.string('role').defaultTo('user');
    table.boolean('is_active').defaultTo(true);
    table.boolean('email_verified').defaultTo(false);
    table.timestamp('created_at').defaultTo(testDb.fn.now());
    table.timestamp('updated_at').defaultTo(testDb.fn.now());
    table.timestamp('last_login').nullable();
  });

  // Clear any existing test data
  await cleanupTestData();

  // Create test users
  await Promise.all([
    createTestUser(TEST_USERS.user),
    createTestUser(TEST_USERS.admin)
  ]);
}
