import { vectorDB, EmbeddingResult } from '../vector';
import logger from '../utils/logger.js';

// Mock logger to avoid console output during tests
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
}));

describe('Vector Database', () => {
  // Test data
  const testEmbedding1 = Array(1536).fill(0.1);
  const testEmbedding2 = Array(1536).fill(0.9);
  const testMetadata1 = { type: 'test', category: 'unit' };
  const testMetadata2 = { type: 'test', category: 'integration' };
  let testId1: string;
  let testId2: string;

  beforeAll(async () => {
    // Initialize the vector database before running tests
    try {
      await vectorDB.initialize();
    } catch (error) {
      logger.error('Failed to initialize vector database for tests', { error });
      throw error;
    }
  });

  afterAll(async () => {
    // Clean up test data after all tests
    try {
      if (testId1) await vectorDB.deleteEmbedding(testId1).catch(() => {});
      if (testId2) await vectorDB.deleteEmbedding(testId2).catch(() => {});
    } catch (error) {
      logger.error('Error during test cleanup', { error });
    }
  });

  describe('upsertEmbedding', () => {
    it('should insert a new embedding', async () => {
      const result = await vectorDB.upsertEmbedding(
        undefined, // auto-generate ID
        testEmbedding1,
        testMetadata1,
        'Test document 1'
      );

      expect(result).toHaveProperty('id');
      expect(result.embedding).toEqual(testEmbedding1);
      expect(result.metadata).toMatchObject(testMetadata1);
      expect(result.document).toBe('Test document 1');

      // Save ID for later tests
      testId1 = result.id;
    });

    it('should update an existing embedding', async () => {
      const updatedMetadata = { ...testMetadata1, updated: true };
      const result = await vectorDB.upsertEmbedding(
        testId1,
        testEmbedding1,
        updatedMetadata,
        'Updated test document'
      );

      expect(result.id).toBe(testId1);
      expect(result.metadata).toMatchObject(updatedMetadata);
      expect(result.document).toBe('Updated test document');
    });
  });

  describe('getEmbedding', () => {
    it('should retrieve an existing embedding', async () => {
      const result = await vectorDB.getEmbedding(testId1);
      
      expect(result).not.toBeNull();
      expect(result?.id).toBe(testId1);
      expect(result?.embedding).toEqual(testEmbedding1);
    });

    it('should return null for non-existent ID', async () => {
      const result = await vectorDB.getEmbedding('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('querySimilarEmbeddings', () => {
    beforeAll(async () => {
      // Add a second embedding for similarity testing
      const result = await vectorDB.upsertEmbedding(
        undefined, // auto-generate ID
        testEmbedding2,
        testMetadata2,
        'Test document 2'
      );
      testId2 = result.id;
    });

    it('should find similar embeddings', async () => {
      // Query with a vector similar to testEmbedding1
      const similarToEmbedding1 = Array(1536).fill(0.11); // Slightly different
      const results = await vectorDB.querySimilarEmbeddings(similarToEmbedding1, 2);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.id === testId1)).toBe(true);
      
      // The most similar should be testEmbedding1 (closer to the query vector)
      if (results.length > 0 && results[0].distance !== undefined) {
        const firstDistance = results[0].distance as number;
        const secondDistance = results[1]?.distance as number || firstDistance + 1;
        expect(firstDistance).toBeLessThanOrEqual(secondDistance);
      }
    });

    it('should respect the topK parameter', async () => {
      const results = await vectorDB.querySimilarEmbeddings(testEmbedding1, 1);
      expect(results.length).toBe(1);
    });

    it('should filter by metadata', async () => {
      const results = await vectorDB.querySimilarEmbeddings(
        testEmbedding1,
        2,
        { category: 'integration' }
      );
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.metadata.category === 'integration')).toBe(true);
    });
  });

  describe('deleteEmbedding', () => {
    it('should delete an existing embedding', async () => {
      const result = await vectorDB.deleteEmbedding(testId2);
      expect(result).toBe(true);
      
      // Verify it's gone
      const retrieved = await vectorDB.getEmbedding(testId2);
      expect(retrieved).toBeNull();
    });

    it('should handle non-existent ID gracefully', async () => {
      const result = await vectorDB.deleteEmbedding('non-existent-id');
      expect(result).toBe(true); // Deletion of non-existent ID is considered successful
    });
  });

  describe('countEmbeddings', () => {
    it('should return the correct count of embeddings', async () => {
      const count = await vectorDB.countEmbeddings();
      expect(count).toBeGreaterThanOrEqual(1); // At least testId1 should exist
    });
  });

  describe('legacy functions', () => {
    it('should support legacy upsertEmbedding function', async () => {
      const result = await vectorDB.upsertEmbedding(
        undefined,
        testEmbedding1,
        { legacy: true },
        'Legacy test'
      );
      
      expect(result).toHaveProperty('id');
      expect(result.metadata).toHaveProperty('legacy', true);
      
      // Clean up
      await vectorDB.deleteEmbedding(result.id);
    });

    it('should support legacy querySimilarEmbeddings function', async () => {
      const results = await vectorDB.querySimilarEmbeddings(testEmbedding1, 1);
      expect(Array.isArray(results)).toBe(true);
    });
  });
});
