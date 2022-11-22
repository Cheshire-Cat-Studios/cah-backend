import {Event} from '@cheshire-cat-studios/jester'

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