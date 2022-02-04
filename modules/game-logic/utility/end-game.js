const redis_client = require('../../redis'),
	Game = require('../../../models/Game')

module.exports = async (io, socket, redis_keys) => {
	await redis_client.del(redis_keys.game.state)
	await redis_client.del(redis_keys.game.deck)
	await redis_client.del(redis_keys.game.players)
	await redis_client.del(redis_keys.game.cards_in_play)

	const game = new Game().find(socket.user.current_game)

	const players = game.players()
		.handle()
		.select('uuid')
		.get()
		.map(player => player.row.uuid)

	game.players()
		.handle()
		.update({
			'current_game': null,
		})


	for (const uuid of players) {
		await redis_client.del(`players.${uuid}.deck`)
		await redis_client.del(`players.${uuid}.hand`)
		await redis_client.del(`players.${uuid}.is_active`)
	}

	game.delete()
}