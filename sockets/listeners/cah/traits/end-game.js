const redis_client = require('../../../../modules/redis'),
	Game = require('../../../../models/Game')

module.exports = () => ({
	async endGame(){
		this.redis.del(this.getGameRedisKey('state'))
		this.redis.del(this.getGameRedisKey('deck'))
		this.redis.del(this.getGameRedisKey('players'))
		this.redis.del(this.getGameRedisKey('cards_in_play'))

		const game = await new Game().find(this.socket.user.current_game)

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
			this.redis.del(this.getPlayerRedisKey('deck', uuid))
			this.redis.del(this.getPlayerRedisKey('hand', uuid))
			this.redis.del(this.getPlayerRedisKey('is_active', uuid))
		}
	}
})