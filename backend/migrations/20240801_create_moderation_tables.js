const { v4: uuidv4 } = require('uuid');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // Create content_flags table
  await knex.schema.createTable('content_flags', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('content_id').notNullable();
    table.enum('content_type', ['whisper', 'comment', 'user']).notNullable();
    table.string('reason').notNullable();
    table.text('details');
    table.enum('status', ['pending', 'resolved', 'rejected']).defaultTo('pending');
    table.string('resolution').nullable();
    
    // User who reported the content (can be null for anonymous reports)
    table.uuid('reported_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.string('reporter_ip').nullable();
    
    // Moderator who resolved the flag (if any)
    table.uuid('resolved_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('resolved_at').nullable();
    
    // Moderation notes
    table.text('moderator_note').nullable();
    
    // Timestamps
    table.timestamps(true, true);
    
    // Indexes
    table.index(['content_id', 'content_type']);
    table.index('status');
    table.index('reported_by');
  });

  // Create moderation_actions table for audit logging
  await knex.schema.createTable('moderation_actions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // Action details
    table.string('action').notNullable(); // e.g., 'user_suspended', 'content_removed'
    table.text('reason').nullable();
    table.jsonb('metadata').defaultTo('{}');
    
    // Target of the action
    table.uuid('target_user_id').nullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('target_content_id').nullable();
    table.string('target_content_type').nullable();
    
    // Moderator who performed the action
    table.uuid('moderator_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    
    // Timestamps
    table.timestamps(true, true);
    
    // Indexes
    table.index('target_user_id');
    table.index('moderator_id');
    table.index('action');
  });

  // Create user_suspensions table
  await knex.schema.createTable('user_suspensions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    // User being suspended
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    
    // Suspension details
    table.text('reason').notNullable();
    table.timestamp('starts_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('ends_at').nullable(); // null = permanent
    
    // Moderator who issued the suspension
    table.uuid('moderator_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    
    // Status
    table.boolean('is_active').defaultTo(true);
    table.timestamp('revoked_at').nullable();
    table.uuid('revoked_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.text('revoke_reason').nullable();
    
    // Timestamps
    table.timestamps(true, true);
    
    // Indexes
    table.index('user_id');
    table.index('moderator_id');
    table.index('is_active');
  });

  // Add is_moderator column to users table
  await knex.schema.table('users', (table) => {
    table.boolean('is_moderator').defaultTo(false);
    table.timestamp('last_moderated_at').nullable();
  });

  // Add content_status column to content tables
  const contentTables = ['whispers', 'comments'];
  for (const tableName of contentTables) {
    await knex.schema.alterTable(tableName, (table) => {
      table.enum('status', ['active', 'hidden', 'deleted']).defaultTo('active');
      table.uuid('moderated_by').nullable().references('id').inTable('users').onDelete('SET NULL');
      table.timestamp('moderated_at').nullable();
      table.text('moderation_notes').nullable();
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Drop tables in reverse order
  await knex.schema.dropTableIfExists('user_suspensions');
  await knex.schema.dropTableIfExists('moderation_actions');
  await knex.schema.dropTableIfExists('content_flags');
  
  // Remove columns from users table
  await knex.schema.table('users', (table) => {
    table.dropColumn('is_moderator');
    table.dropColumn('last_moderated_at');
  });
  
  // Remove columns from content tables
  const contentTables = ['whispers', 'comments'];
  for (const tableName of contentTables) {
    await knex.schema.alterTable(tableName, (table) => {
      table.dropColumn('status');
      table.dropColumn('moderated_by');
      table.dropColumn('moderated_at');
      table.dropColumn('moderation_notes');
    });
  }
};
