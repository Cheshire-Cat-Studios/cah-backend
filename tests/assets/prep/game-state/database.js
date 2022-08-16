const
	Game = require('../../../../models/Game'),
	User = require('../../../../models/User'),
	GameFactory = require('../../../../database/factories/GameFactory'),
	UserFactory = require('../../../../database/factories/UserFactory')

module.exports = async (
	{
		password = '',
		max_score = 5,
		max_players = 2
	} = {
		password: '',
		max_score: 5,
		max_players: 3
	},
	player_count = 3
) => {
	await (new GameFactory)
		.setCount(1)
		.setRow({
			password,
			max_score,
			max_players
		})
		.store()

	const game = await (new Game).first()

	await (new UserFactory)
		.setCount(player_count)
		.setRow({
			current_game: game.row.id
		})
		.store()

	const users = await (new User).get()

	//TODO: random number helper
	await game.update({
		host_id: users[Math.floor(Math.random()*users.length)].row.id
	})

	return {
		game,
		users
	}
}