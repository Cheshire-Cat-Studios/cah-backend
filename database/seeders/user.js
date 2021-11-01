const createUniqueId = require('../../helpers/createUniqueId')
faker = require('faker')

module.exports = () => ({
	id: null,
	uuid: createUniqueId('user'),
	name: faker.name.findName(),
	secret: faker.random.alpha(25),
	current_game: null,
	score: null,
	taken_turn: null,
	is_czar: null,
})