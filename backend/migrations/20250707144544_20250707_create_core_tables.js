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
    // v1.10 additions:
    tbl.string("emotional_tone", 32); // e.g., sadness, gratitude, etc.
    tbl.string("whisper_type", 32); // e.g., vent, question, poetic, gratitude
    tbl.string("soft_title", 64); // e.g., "Quiet Seeker"
    tbl.string("ai_reply_status", 16); // queued, processing, done, failed
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

  // v1.10: AI job logging table
  await knex.schema.createTable("whisper_ai_logs", tbl => {
    tbl.increments("id").primary();
    tbl.integer("whisper_id").references("id").inTable("whispers").onDelete("CASCADE");
    tbl.string("job_type", 32); // reply, title, etc.
    tbl.string("status", 16); // queued, processing, done, failed
    tbl.text("error");
    tbl.timestamp("created_at").defaultTo(knex.fn.now());
    tbl.timestamp("updated_at").defaultTo(knex.fn.now());
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
  await knex.schema.dropTableIfExists("whisper_ai_logs");
  // Remove guest_id column if it exists (for rollback)
  const hasWhispers = await knex.schema.hasTable("whispers");
  if (hasWhispers) {
    // Remove v1.10 columns if they exist
    const columns = ["emotional_tone", "whisper_type", "soft_title", "ai_reply_status"];
    for (const col of columns) {
      const hasCol = await knex.schema.hasColumn("whispers", col);
      if (hasCol) {
        await knex.schema.table("whispers", tbl => {
          tbl.dropColumn(col);
        });
      }
    }
    const hasGuestId = await knex.schema.hasColumn("whispers", "guest_id");
    if (hasGuestId) {
      await knex.schema.table("whispers", tbl => {
        tbl.dropColumn("guest_id");
      });
    }
  }
  await knex.schema.dropTableIfExists("whispers");
}
