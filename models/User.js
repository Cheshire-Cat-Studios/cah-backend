const Model = require('./Model'),
	BelongsTo = require('./relationships/BelongsTo')

module.exports = class User extends Model {
	table_name = 'users'

	game() {
		return new BelongsTo(require('./Game'), 'current_game', 'id', this.row.current_game)
	}

	joinGame(game){
		this.update({
			current_game: game.row.id,
			score: null,
			taken_turn: null,
			is_czar: null,
		})
	}
}