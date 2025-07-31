import * as Knex from 'knex';

/**
 * @param {Knex} knex
 */
export const up = async (knex) => {
  // Add indexes to WHISPERS table
  await knex.schema.alterTable('whispers', (table) => {
    // Index for sorting by creation date (common for displaying recent whispers)
    table.index('created_at', 'idx_whispers_created_at');
    
    // Composite index for filtering by zone and emotion (common query pattern)
    table.index(['zone', 'emotion'], 'idx_whispers_zone_emotion');
    
    // Index for expiration cleanup
    table.index('expires_at', 'idx_whispers_expires_at');
  });

  // Add indexes to WHISPER_REACTIONS table
  await knex.schema.alterTable('whisper_reactions', (table) => {
    // Index for looking up reactions by whisper (common for displaying reactions)
    table.index('whisper_id', 'idx_whisper_reactions_whisper_id');
    
    // Index for tracking user activity (guest_id)
    table.index('guest_id', 'idx_whisper_reactions_guest_id');
    
    // Composite index for checking if a user has already reacted to a whisper
    table.index(['whisper_id', 'guest_id'], 'idx_whisper_reactions_whisper_guest');
  });

  // Add indexes to AI_REPLY_JOBS table
  await knex.schema.alterTable('ai_reply_jobs', (table) => {
    // Index for job scheduling (status + run_at)
    table.index(['status', 'run_at'], 'idx_ai_reply_jobs_status_run_at');
    
    // Index for looking up jobs by whisper_id
    table.index('whisper_id', 'idx_ai_reply_jobs_whisper_id');
  });

  // Add index to WHISPER_EMBEDDINGS table
  await knex.schema.alterTable('whisper_embeddings', (table) => {
    // Ensure the IVFFLAT index is created for vector similarity search
    // Note: This is a placeholder - actual vector index creation may be database-specific
    // and might require raw SQL for some databases
    table.index('embedding', 'idx_whisper_embeddings_embedding', null, {
      indexType: 'ivfflat',
      lists: 100  // Number of clusters for IVFFLAT index (tunable parameter)
    });
  });
};

/**
 * @param {Knex} knex
 */
export const down = async (knex) => {
  // Drop all indexes in reverse order of creation
  await knex.schema.alterTable('whisper_embeddings', (table) => {
    table.dropIndex('', 'idx_whisper_embeddings_embedding');
  });

  await knex.schema.alterTable('ai_reply_jobs', (table) => {
    table.dropIndex('', 'idx_ai_reply_jobs_whisper_id');
    table.dropIndex('', 'idx_ai_reply_jobs_status_run_at');
  });

  await knex.schema.alterTable('whisper_reactions', (table) => {
    table.dropIndex('', 'idx_whisper_reactions_whisper_guest');
    table.dropIndex('', 'idx_whisper_reactions_guest_id');
    table.dropIndex('', 'idx_whisper_reactions_whisper_id');
  });

  await knex.schema.alterTable('whispers', (table) => {
    table.dropIndex('', 'idx_whispers_expires_at');
    table.dropIndex('', 'idx_whispers_zone_emotion');
    table.dropIndex('', 'idx_whispers_created_at');
  });
};
