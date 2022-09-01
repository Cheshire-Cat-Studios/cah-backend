const {Event} = require('jester'),
	runQueue = require('../queue/run-queue')

module.exports = class GameCreated extends Event {
	constructor() {
		super('game-created', true)
	}

	async handle(game_id) {
		console.log(123131)
		await runQueue(game_id)
	}
}