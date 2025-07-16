/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Whispers (existing)
  await knex.schema.createTable("whispers", tbl => {
    tbl.increments("id").primary();
    tbl.text("content").notNullable();
    tbl.string("emotion", 32);
    tbl.string("zone", 64);
    tbl.boolean("is_ai_generated").defaultTo(false);
    tbl.timestamp("expires_at");
    tbl.timestamp("created_at").defaultTo(knex.fn.now());
    tbl.string("guest_id", 64); // NEW: guest_id for user association
  });

  // Reactions (existing)
  await knex.schema.createTable("whisper_reactions", tbl => {
    tbl.increments("id").primary();
    tbl.integer("whisper_id").references("id").inTable("whispers").onDelete("CASCADE");
    tbl.string("guest_id", 64);
    tbl.string("emoji", 8);
    tbl.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // NEW  ➜  Vector / Embedding table (Memory Map)
  await knex.schema.createTable("whisper_embeddings", tbl => {
    tbl.integer("whisper_id").primary().references("id").inTable("whispers").onDelete("CASCADE");
    tbl.specificType("embedding", "vector(1536)"); // → pgvector on Railway
    tbl.index(["embedding"], "whisper_embedding_ivfflat", "ivfflat"); // only for Postgres
  });

  // Reports (NEW)
  await knex.schema.createTable("whisper_reports", tbl => {
    tbl.increments("id").primary();
    tbl.integer("whisper_id").references("id").inTable("whispers").onDelete("CASCADE");
    tbl.text("reason");
    tbl.string("guest_id", 64);
    tbl.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // Whisper Replies (NEW for v1.9)
  await knex.schema.createTable("whisper_replies", tbl => {
    tbl.increments("id").primary();
    tbl.integer("whisper_id").references("id").inTable("whispers").onDelete("CASCADE");
    tbl.text("content").notNullable();
    tbl.string("guest_id", 64);
    tbl.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // Banned Users (for moderation)
  await knex.schema.createTable("banned_users", tbl => {
    tbl.string("guest_id", 64).primary();
    tbl.timestamp("banned_at").defaultTo(knex.fn.now());
    tbl.text("reason");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("whisper_embeddings");
  await knex.schema.dropTableIfExists("whisper_reactions");
  await knex.schema.dropTableIfExists("whisper_reports");
  await knex.schema.dropTableIfExists("whisper_replies");
  await knex.schema.dropTableIfExists("banned_users");
  // Remove guest_id column if it exists (for rollback)
  const hasWhispers = await knex.schema.hasTable("whispers");
  if (hasWhispers) {
    const hasGuestId = await knex.schema.hasColumn("whispers", "guest_id");
    if (hasGuestId) {
      await knex.schema.table("whispers", tbl => {
        tbl.dropColumn("guest_id");
      });
    }
  }
  await knex.schema.dropTableIfExists("whispers");
}
