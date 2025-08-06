const { v4: uuidv4 } = require('uuid');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Create content_flags table
  await knex.schema.createTable('content_flags', (table) => {
    table.string('id').primary().defaultTo(uuidv4());
    table.string('content_id').notNullable();
    table.string('content_type').notNullable(); // Changed from enum to string for SQLite
    table.string('reason').notNullable();
    table.text('details');
    table.string('status').defaultTo('pending');
    table.string('resolution').nullable();
    
    // User who reported the content (can be null for anonymous reports)
    table.string('reported_by').nullable();
    table.string('reporter_ip').nullable();
    
    // Moderator who resolved the flag (if any)
    table.string('resolved_by').nullable();
    table.timestamp('resolved_at').nullable();
    
    // Moderation notes
    table.text('moderator_note').nullable();
    
    // Timestamps
    table.timestamps(true, true);
  });

  // Create moderation_actions table for audit logging
  await knex.schema.createTable('moderation_actions', (table) => {
    table.string('id').primary().defaultTo(uuidv4());
    
    // Action details
    table.string('action').notNullable();
    table.text('reason').nullable();
    table.text('metadata').defaultTo('{}'); // Changed from jsonb to text for SQLite
    
    // Target of the action
    table.string('target_user_id').nullable();
    table.string('target_content_id').nullable();
    table.string('target_content_type').nullable();
    
    // Moderator who performed the action
    table.string('moderator_id').nullable();
    
    // Timestamps
    table.timestamps(true, true);
    
    // Indexes
    table.index('target_user_id');
    table.index('moderator_id');
  });

  // Create user_suspensions table
  await knex.schema.createTable('user_suspensions', (table) => {
    table.string('id').primary().defaultTo(uuidv4());
    
    // Suspension details
    table.string('user_id').notNullable();
    table.text('reason').notNullable();
    table.timestamp('suspended_until').notNullable();
    table.boolean('is_permanent').defaultTo(false);
    
    // Moderator who issued the suspension
    table.string('moderator_id').notNullable();
    
    // Timestamps
    table.timestamps(true, true);
    
    // Indexes
    table.index('user_id');
    table.index('suspended_until');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('user_suspensions');
  await knex.schema.dropTableIfExists('moderation_actions');
  await knex.schema.dropTableIfExists('content_flags');
};
