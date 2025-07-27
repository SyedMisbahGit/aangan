import { db } from '../db';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface TestUser {
  id: string;
  username: string;
  email: string;
  password: string;
  token?: string;
}

export const createTestUser = async (userData?: Partial<TestUser>): Promise<TestUser> => {
  const password = userData?.password || 'password';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const [user] = await db('users')
    .insert({
      id: userData?.id || uuidv4(),
      username: userData?.username || `testuser-${Math.random().toString(36).substring(2, 8)}`,
      email: userData?.email || `test-${Math.random().toString(36).substring(2, 8)}@example.com`,
      password_hash: hashedPassword,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .returning(['id', 'username', 'email']);

  return {
    ...user,
    password
  };
};

export const createTestWhisper = async (userId: string, whisperData?: any) => {
  const [whisper] = await db('whispers')
    .insert({
      id: whisperData?.id || uuidv4(),
      user_id: userId,
      content: whisperData?.content || `Test whisper ${Math.random().toString(36).substring(2, 8)}`,
      is_anonymous: whisperData?.is_anonymous !== undefined ? whisperData.is_anonymous : true,
      created_at: new Date().toISOString()
    })
    .returning('*');
  
  return whisper;
};

export const cleanupTestData = async () => {
  await db('whispers').del();
  await db('users').where('email', 'like', 'test%@example.com').del();
};

export const loginTestUser = async (app: any, email: string, password: string) => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  
  if (response.status !== 200) {
    throw new Error(`Failed to login test user: ${response.body.error || 'Unknown error'}`);
  }
  
  return response.body.token;
};
