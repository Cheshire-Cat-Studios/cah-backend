const redis_client = require('../redis'),
	JSON5 = require('json5'),
	Game = require('../../models/Game'),
	User = require('../../models/User'),
	endGame = require('./utility/end-game')

module.exports = async (io, socket, redis_keys) => {
	const game = await new Game()
		.whereEquals('id', socket.user.current_game)
		.first()

	if (
		socket.user.id !== game?.row?.host_id
	) {
		return
	}

	const czar = game.players()
		.handle()
		.orderBy('RANDOM()')
		.first()
		.row
		.uuid

	await redis_client.hSet(redis_keys.game.state, 'current_czar', czar)
	await redis_client.hSet(redis_keys.game.state, 'is_started', 'true');


	(await io.in('game.' + socket.user.current_game).fetchSockets())
		.forEach(user_socket => {
			user_socket.emit(
				'game-started',
				{
					is_czar: user_socket.user.uuid === czar
				}
			)
		})


	// setTimeout(
	// 	async () => {
	// 		const players = await redis_client.hGetAll(redis_keys.game.players),
	// 			mapped_players = Object.keys(players).map(uuid => JSON5.parse(players[uuid]))
	//
	// 		io.to('game.' + socket.user.current_game)
	// 			.emit('time-limit-reached', mapped_players)
	//
	// 		endGame(io, socket, redis_keys)
	// 	},
	// 	(game.row.game_time_limit_mins * 60)* 1000
	// )
}