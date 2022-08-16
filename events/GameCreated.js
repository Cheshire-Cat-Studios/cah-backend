const Event = require('./Event'),
	redis_client = require('../modules/redis'),
	shuffle = require('lodash.shuffle'),
	game_deck = require('../config/decks/blackCards'),
	runQueue = require('../queue/run-queue')

module.exports = class GameCreated extends Event {
	constructor() {
		super('game-created', true)
	}

	//TODO: only id is used, probably best to only pass to the event exactly whats used?
	async handle(game_id) {
		runQueue(game_id)
		// await redis_client.lPush(`game.${game_data.id}.deck`,shuffle(game_deck))
	}
}