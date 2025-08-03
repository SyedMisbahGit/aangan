// Setup test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'test-secret';

// Import types for Jest
import { jest } from '@jest/globals';

// Define the logger interface for type safety
interface MockLogger {
  info: jest.Mock;
  error: jest.Mock;
  warn: jest.Mock;
  debug: jest.Mock;
  stream: {
    write: jest.Mock;
  };
}

// Mock logger to avoid console output during tests
const mockLogger: MockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  stream: {
    write: jest.fn()
  }
};

// Mock the logger module with proper typing
jest.mock('../utils/logger', () => mockLogger);

// Global test timeout
jest.setTimeout(30000); // 30 seconds

// Export the mock logger for use in tests
export { mockLogger };
