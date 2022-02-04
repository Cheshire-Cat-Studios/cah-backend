const Table = require('./Table')

module.exports = () => {
	return new Table()
		.setName('games')
		.create(column => {
			column().id()

			column().string('uuid', 100)
				.setUnique(true)

			column().string('name', 100)

			column().string('password', 100)

			column().integer('host_id')

			column().boolean('max_score')

			column().boolean('max_players')

			column().boolean('round_time_limit_mins')

			column().boolean('game_time_limit_mins')
		})
}