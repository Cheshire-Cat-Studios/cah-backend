const redis_client = require('../../redis'),
	Game = require('../../../models/Game')

module.exports = () => ({
	endGame: async () => {
		console.log('GAME ENDED')

		redis_client.del(this.getGameRedisKey('state'))
		redis_client.del(this.getGameRedisKey('deck'))
		redis_client.del(this.getGameRedisKey('players'))
		redis_client.del(this.getGameRedisKey('cards_in_play'))

		const game = await new Game().find(socket.user.current_game)

		game.delete()

		const players_unmapped = await game.players()
			.handle()
			.select('uuid')
			.get()

		game.players()
			.handle()
			.update({
				'current_game': null,
			})

		const players = players_unmapped
			.map(player => player.row.uuid)

		for (const uuid of players) {
			redis_client.del(this.getPlayerRedisKey('deck', uuid))
			redis_client.del(this.getPlayerRedisKey('hand', uuid))
			redis_client.del(this.getPlayerRedisKey('is_active', uuid))
		}
	}
})