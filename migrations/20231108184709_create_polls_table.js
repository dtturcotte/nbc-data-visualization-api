exports.up = function (knex) {
	return knex.schema.createTable('polls', (table) => {
		table.increments('id').primary()
		table.string('name').notNullable()
		table.integer('value').notNullable()
		table.timestamps(true, true)
	})
}

exports.down = function (knex) {
	return knex.schema.dropTable('polls')
}
