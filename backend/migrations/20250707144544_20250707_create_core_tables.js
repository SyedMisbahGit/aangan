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
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("whisper_embeddings");
  await knex.schema.dropTableIfExists("whisper_reactions");
  await knex.schema.dropTableIfExists("whispers");
}
