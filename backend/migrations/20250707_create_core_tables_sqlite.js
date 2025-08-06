const { v4: uuidv4 } = require('uuid');

/**
 * SQLite-compatible version of create_core_tables
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
function up(knex) {
  return knex.schema
    // Whispers table
    .createTable('whispers', (tbl) => {
      tbl.increments('id').primary();
      tbl.text('content').notNullable();
      tbl.string('emotion', 32);
      tbl.string('zone', 64);
      tbl.boolean('is_ai_generated').defaultTo(false);
      tbl.timestamp('expires_at');
      tbl.timestamp('created_at').defaultTo(knex.fn.now());
      tbl.string('guest_id', 64);
      tbl.string('emotional_tone', 32);
      tbl.string('whisper_type', 32);
      tbl.string('soft_title', 64);
      tbl.string('ai_reply_status', 16);
    })
    
    // Whisper reactions
    .createTable('whisper_reactions', (tbl) => {
      tbl.increments('id').primary();
      tbl.integer('whisper_id').unsigned().references('id').inTable('whispers').onDelete('CASCADE');
      tbl.string('guest_id', 64);
      tbl.string('emoji', 8);
      tbl.timestamp('created_at').defaultTo(knex.fn.now());
    })
    
    // Whisper reports
    .createTable('whisper_reports', (tbl) => {
      tbl.increments('id').primary();
      tbl.integer('whisper_id').unsigned().references('id').inTable('whispers').onDelete('CASCADE');
      tbl.text('reason');
      tbl.string('guest_id', 64);
      tbl.timestamp('created_at').defaultTo(knex.fn.now());
    })
    
    // Whisper replies
    .createTable('whisper_replies', (tbl) => {
      tbl.increments('id').primary();
      tbl.integer('whisper_id').unsigned().references('id').inTable('whispers').onDelete('CASCADE');
      tbl.text('content').notNullable();
      tbl.string('guest_id', 64);
      tbl.boolean('is_ai_generated').defaultTo(false);
      tbl.timestamp('created_at').defaultTo(knex.fn.now());
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
function down(knex) {
  return knex.schema
    .dropTableIfExists('whisper_replies')
    .dropTableIfExists('whisper_reports')
    .dropTableIfExists('whisper_reactions')
    .dropTableIfExists('whispers');
}

module.exports = { up, down };
