exports.up = function(knex) {
  return knex.schema.createTable('refresh_tokens', (table) => {
    table.string('id').primary(); // JTI (JWT ID)
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('token').notNullable();
    table.timestamp('expires_at').notNullable();
    table.boolean('used').defaultTo(false);
    table.timestamp('revoked_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index(['user_id', 'used']);
    table.index('expires_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('refresh_tokens');
};
