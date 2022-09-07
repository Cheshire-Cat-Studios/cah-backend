const
	{Factory} = require('jester'),
	User = require('../../models/User'),
	createUniqueId = require('../../helpers/createUniqueId')

module.exports = class GameFactory extends Factory {
	constructor() {
		super()
		this.model = new User
	}

	schema() {
		return {
			uuid: createUniqueId('user'),
			name: this.faker.name.firstName(),
			current_game: null,
		}
	}
}