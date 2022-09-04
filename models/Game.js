const
	{
		Model,
		relationships: {
			BelongsTo,
			HasMany
		}
	} = require('jester')

module.exports = class Game extends Model {
	table_name = 'games'

	host() {
		return new BelongsTo(require('./User'), 'host_id', 'id', this.row.host_id)
	}

	players() {
		return new HasMany(require('./User'), 'id', 'current_game', this.row.id)
	}

	getState() {
		//TODO: built logic to get all players game meta data and cards in play etc

	}
}