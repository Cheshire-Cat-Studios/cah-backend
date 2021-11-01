const Model = require('./Model'),
	Game = require('./Game')

module.exports = class User extends Model {
	table_name = 'users'

	game() {
		return this.belongsTo(Game, 'current_game')
	}

	// gameModel() {
	// 	return this.belongsTo(, 'current_game')
	// }
}