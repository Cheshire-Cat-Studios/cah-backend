const Model = require('./Model'),
 User = require('./User')

module.exports = class Game extends Model{
	table_name = 'games'

	host(){
		return this.belongsTo(User)
	}

}