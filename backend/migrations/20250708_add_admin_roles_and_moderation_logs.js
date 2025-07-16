/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Add role and email to admin_users
  const hasRole = await knex.schema.hasColumn("admin_users", "role");
  if (!hasRole) {
    await knex.schema.alterTable("admin_users", tbl => {
      tbl.string("role", 32).defaultTo("admin"); // roles: moderator, admin, super_admin
      tbl.string("email", 128).unique();
    });
  }

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
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("moderation_logs");
  await knex.schema.dropTableIfExists("ban_history");
  await knex.schema.dropTableIfExists("otp_tokens");
  // Remove role and email columns if rolling back
  const hasRole = await knex.schema.hasColumn("admin_users", "role");
  if (hasRole) {
    await knex.schema.alterTable("admin_users", tbl => {
      tbl.dropColumn("role");
      tbl.dropColumn("email");
    });
  }
} 