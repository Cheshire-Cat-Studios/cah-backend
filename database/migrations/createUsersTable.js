const Table = require('./Table')

module.exports = () => {
	return new Table()
		.setName('users')
		.create(column => {
			column().id()

			column().string('uuid', 100)
				.setUnique(true)

			column().string('name', 100)

			// column().string('secret', 100)

			column().integer('current_game')
				.setNullable()
		})
}