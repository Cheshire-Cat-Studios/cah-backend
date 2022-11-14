import {Event} from '@cheshire-cat-studios/jester'
// import runQueue from '../queue/run-queue.js'

class GameCreated extends Event {
	constructor() {
		super('game-created', true)
	}

	// @ts-ignore
	async handle(game_id: number): Promise<void> {
		// await runQueue(game_id)
	}
}

export default GameCreated