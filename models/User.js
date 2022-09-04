const
	{
		Model,
		relationships: {
			BelongsTo
		}
	} = require('jester')

module.exports = class User extends Model {
	table_name = 'users'

	game() {
		return new BelongsTo(require('./Game'), 'current_game', 'id', this.row.current_game)
	}

	async joinGame(game){
		await this.update({
			current_game: game.row.id,
		})
	}
}