const Event = require('./Event'),
	redis_client = require('../modules/redis'),
	base_state = {
		is_started: false,
		is_czar_phase: false,
		players: {},
	},
	shuffle = require('lodash.shuffle'),
	game_deck = require('../config/decks/blackCards')

module.exports = class GameCreated extends Event {
	constructor() {
		super('game_created', true)
	}

	//TODO: only id is used, probably best to only pass to the event exactly whats used?
	async handle(game_data) {
		//TODO: consider storing players data to another hash key set?
		await redis_client.sendCommand([
			'HMSET',
			`game.${game_data.id}.state`,
			'is_started',
			'false',
			'is_czar_phase',
			'false',
			'current_czar',
			'',
			'max_score',
			`${game_data.max_score}`
		])

		await redis_client.lPush(`game.${game_data.id}.deck`,shuffle(game_deck))
	}
}