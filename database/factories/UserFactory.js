const Factory = require('./Factory'),
	User = require('../../models/user'),
	createUniqueId = require('../../helpers/createUniqueId')

module.exports = class GameFactory extends Factory {
	constructor() {
		super()
		this.model = new User
	}

	schema() {
		return {
			id: null,
			uuid: createUniqueId('user'),
			name: this.faker.name.findName(),
			current_game: null,
		}
	}
}