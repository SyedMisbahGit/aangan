/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Add role and email to admin_users
  // Commented out admin_users table changes due to missing table in SQLite
  // await knex.schema.table("admin_users", tbl => {
  //   tbl.string("role", 32).defaultTo("admin");
  //   tbl.string("email", 128);
  // });

  // Moderation logs
  await knex.schema.createTable("moderation_logs", tbl => {
    tbl.increments("id").primary();
    tbl.integer("admin_id").references("id").inTable("admin_users").onDelete("SET NULL");
    tbl.string("action", 64).notNullable();
    tbl.string("target_id", 64); // guest_id, whisper_id, etc.
    tbl.text("reason");
    tbl.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // Ban/unban history
  await knex.schema.createTable("ban_history", tbl => {
    tbl.increments("id").primary();
    tbl.string("guest_id", 64).notNullable();
    tbl.string("action", 16).notNullable(); // ban, unban
    tbl.integer("admin_id").references("id").inTable("admin_users").onDelete("SET NULL");
    tbl.text("reason");
    tbl.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // OTP tokens for email/magic link login
  await knex.schema.createTable("otp_tokens", tbl => {
    tbl.increments("id").primary();
    tbl.string("email", 128).notNullable();
    tbl.string("token", 64).notNullable();
    tbl.timestamp("expires_at").notNullable();
    tbl.boolean("used").defaultTo(false);
    tbl.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // Create ai_reply_jobs table for AI reply job queue
  const exists = await knex.schema.hasTable('ai_reply_jobs');
  if (!exists) {
    await knex.schema.createTable('ai_reply_jobs', tbl => {
      tbl.increments('id').primary();
      tbl.string('whisper_id', 64).notNullable();
      tbl.string('zone', 64).notNullable();
      tbl.string('emotion', 32).notNullable();
      tbl.bigInteger('run_at').notNullable();
      tbl.string('status', 16).defaultTo('pending');
      tbl.text('error');
      tbl.integer('retry_count').defaultTo(0); // NEW: retry count
      tbl.timestamp('created_at').defaultTo(knex.fn.now());
      tbl.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  } else {
    // If table exists, add retry_count if missing
    const hasRetry = await knex.schema.hasColumn('ai_reply_jobs', 'retry_count');
    if (!hasRetry) {
      await knex.schema.table('ai_reply_jobs', tbl => {
        tbl.integer('retry_count').defaultTo(0);
      });
    }
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("moderation_logs");
  await knex.schema.dropTableIfExists("ban_history");
  await knex.schema.dropTableIfExists("otp_tokens");
  await knex.schema.dropTableIfExists('ai_reply_jobs');
  // Remove role and email columns if rolling back
  // const hasRole = await knex.schema.hasColumn("admin_users", "role");
  // if (hasRole) {
  //   await knex.schema.table("admin_users", tbl => {
  //     tbl.dropColumn("role");
  //     tbl.dropColumn("email");
  //   });
  // }
} 