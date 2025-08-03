// backend/vector.ts
// Vector database operations using ChromaDB

// Import ChromaDB with proper type definitions
import {
  ChromaClient,
  Collection,
  IncludeEnum,
  Where,
} from 'chromadb';
import { v4 as uuidv4 } from 'uuid';
import logger from './utils/logger';

// Types for our vector operations
export interface EmbeddingResult {
  id: string;
  embedding: number[];
  metadata: Record<string, unknown>;
  distance?: number | null;
  document?: string | null;
}

interface VectorDBConfig {
  url: string;
  collectionName: string;
  dimension: number;
}

// Default configuration
const DEFAULT_CONFIG: VectorDBConfig = {
  url: process.env.CHROMA_DB_URL || 'http://localhost:8000',
  collectionName: 'whisper_embeddings',
  dimension: 1536, // Default dimension for text-embedding-3-small
};

class VectorDB {
  private client: ChromaClient;
  private collection: Collection | null = null;
  private config: VectorDBConfig;
  private isInitialized = false;

  constructor(config: Partial<VectorDBConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.client = new ChromaClient({ path: this.config.url });
  }

  /**
   * Initialize the vector database connection and collection
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Test connection
      await this.client.heartbeat();

      // Get or create collection
      const collections = await this.client.listCollections();
      const exists = collections.some(c => c.name === this.config.collectionName);

      if (exists) {
        this.collection = await this.client.getCollection({
          name: this.config.collectionName,
        });
      } else {
        this.collection = await this.client.createCollection({
          name: this.config.collectionName,
          metadata: {
            'hnsw:space': 'cosine',
          },
        });
      }

      this.isInitialized = true;
      logger.info('Vector database initialized successfully');
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to initialize vector database', { error: errorMessage });
      throw new Error(`Vector database initialization failed: ${errorMessage}`);
    }
  }

  /**
   * Ensure the database is initialized
   */
  private async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  /**
   * Upsert an embedding into the vector database
   */
  async upsertEmbedding(
    id: string = uuidv4(),
    embedding: number[],
    metadata: Record<string, unknown> = {},
    document?: string
  ): Promise<EmbeddingResult> {
    try {
      await this.ensureInitialized();

      if (!this.collection) {
        throw new Error('Collection not initialized');
      }

      const enrichedMetadata = {
        ...metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const params: Parameters<Collection['upsert']>[0] = {
        ids: [id],
        embeddings: [embedding],
        metadatas: [enrichedMetadata],
      };

      if (document) {
        params.documents = [document];
      }

      await this.collection.upsert(params);

      return {
        id,
        embedding,
        metadata: enrichedMetadata,
        document,
      };
    } catch (error) {
      logger.error('Failed to upsert embedding', { error, id, metadata });
      throw error;
    }
  }

  /**
   * Query similar embeddings
   */
  async querySimilarEmbeddings(
    queryEmbedding: number[],
    topK: number = 5,
    filter?: Where,
    include: (keyof typeof IncludeEnum)[] = ['metadatas', 'distances', 'documents']
  ): Promise<EmbeddingResult[]> {
    try {
      await this.ensureInitialized();

      if (!this.collection) {
        throw new Error('Collection not initialized');
      }

      const results = await this.collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: topK,
        include,
        where: filter,
      });

      const embeddingResults: EmbeddingResult[] = [];
      if (results.ids && results.ids[0]) {
        results.ids[0].forEach((id: string, index: number) => {
          embeddingResults.push({
            id: id,
            embedding: results.embeddings?.[0]?.[index] || [],
            metadata: (results.metadatas?.[0]?.[index] as Record<string, unknown>) || {},
            distance: results.distances?.[0]?.[index],
            document: results.documents?.[0]?.[index] || null,
          });
        });
      }

      return embeddingResults;
    } catch (error) {
      logger.error('Failed to query similar embeddings', { error });
      throw error;
    }
  }

  /**
   * Get an embedding by ID
   */
  async getEmbedding(id: string): Promise<EmbeddingResult | null> {
    try {
      await this.ensureInitialized();

      if (!this.collection) {
        throw new Error('Collection not initialized');
      }

      const results = await this.collection.get({
        ids: [id],
        include: ['embeddings', 'metadatas', 'documents'],
      });

      if (!results.ids || results.ids.length === 0 || !results.ids[0] || results.ids[0].length === 0) {
        return null;
      }

      const firstResultId = results.ids[0][0];
      const firstResultEmbedding = results.embeddings?.[0]?.[0];
      const firstResultMetadata = results.metadatas?.[0]?.[0];
      const firstResultDocument = results.documents?.[0]?.[0];

      if (!firstResultId) {
        return null;
      }

      const embeddingArray = Array.isArray(firstResultEmbedding) ? firstResultEmbedding : [];
      const metadataObject =
        typeof firstResultMetadata === 'object' && firstResultMetadata !== null && !Array.isArray(firstResultMetadata)
          ? (firstResultMetadata as Record<string, unknown>)
          : {};

      return {
        id: firstResultId,
        embedding: embeddingArray,
        metadata: metadataObject,
        document: firstResultDocument || null,
      };
    } catch (error) {
      logger.error('Failed to get embedding', { error, id });
      throw error;
    }
  }

  /**
   * Delete an embedding by ID
   */
  async deleteEmbedding(id: string): Promise<boolean> {
    try {
      await this.ensureInitialized();

      if (!this.collection) {
        throw new Error('Collection not initialized');
      }

      await this.collection.delete({
        ids: [id],
      });

      return true;
    } catch (error) {
      logger.error('Failed to delete embedding', { error, id });
      throw error;
    }
  }

  /**
   * Count the number of embeddings in the collection
   */
  async countEmbeddings(): Promise<number> {
    try {
      await this.ensureInitialized();

      if (!this.collection) {
        throw new Error('Collection not initialized');
      }

      const count = await this.collection.count();
      return count;
    } catch (error) {
      logger.error('Failed to count embeddings', { error });
      throw error;
    }
  }
}

// Export a singleton instance
export const vectorDB = new VectorDB();

// Legacy function exports for backward compatibility
export async function upsertEmbedding(
  id: string = uuidv4(),
  embedding: number[],
  metadata: Record<string, unknown> = {}
): Promise<{ success: boolean; id: string; embedding: number[]; metadata: Record<string, unknown> }> {
  try {
    const result = await vectorDB.upsertEmbedding(id, embedding, metadata);
    return { success: true, ...result };
  } catch (error) {
    logger.error('Legacy upsertEmbedding failed', { error, id });
    return { success: false, id, embedding, metadata };
  }
}

export async function querySimilarEmbeddings(
  queryEmbedding: number[],
  topK: number = 5
): Promise<EmbeddingResult[]> {
  try {
    return await vectorDB.querySimilarEmbeddings(queryEmbedding, topK);
  } catch (error) {
    logger.error('Legacy querySimilarEmbeddings failed', { error });
    return [];
  }
}