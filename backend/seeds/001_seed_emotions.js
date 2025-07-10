/** @param {import('knex').Knex} knex */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('whisper_reactions').del();
  await knex('whisper_embeddings').del();
  await knex('whispers').del();

  // Insert sample whispers
  const whispers = [
    { content: 'The banyan shade remembers.', emotion: 'nostalgia', zone: 'tapri', is_ai_generated: false },
    { content: 'A gentle breeze stirs hope.', emotion: 'hope', zone: 'veranda', is_ai_generated: false },
    { content: 'Footsteps echo in the dusk.', emotion: 'calm', zone: 'courtyard', is_ai_generated: false },
    { content: 'Laughter lingers by the well.', emotion: 'joy', zone: 'wellside', is_ai_generated: false },
  ];
  await knex('whispers').insert(whispers);
}
