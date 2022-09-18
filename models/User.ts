import {
	Model,
	BelongsTo
} from '@cheshire-cat-studios/jester'
import Game from "./Game.js";

class User extends Model {
	table_name = 'users'

	game(): BelongsTo {
		return new BelongsTo(Game, 'current_game', 'id', this.row.current_game)
	}

	//TODO: create typings file so i can reference game here without recursion buggering everything
	async joinGame(game): Promise<void>{
		await this.update({
			current_game: game.row.id,
		})
	}
}

export default User