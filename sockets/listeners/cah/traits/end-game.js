const
	{redis_client} = require('jester').modules,
	Game = require('../../../../models/Game')

module.exports = () => ({
	async endGame(){
		await this.redis.del(this.getGameRedisKey('state'))
		await this.redis.del(this.getGameRedisKey('deck'))
		await this.redis.del(this.getGameRedisKey('players'))
		await this.redis.del(this.getGameRedisKey('cards_in_play'))

		const game = await new Game().find(this.socket.user.current_game)

		await game.delete()

		const players_unmapped = await game.players()
			.handle()
			.select('uuid')
			.get()

		await game.players()
			.handle()
			.update({
				'current_game': null,
			})

		const players = players_unmapped
			.map(player => player.row.uuid)

		for (const uuid of players) {
			await this.redis.del(this.getPlayerRedisKey('deck', uuid))
			await this.redis.del(this.getPlayerRedisKey('hand', uuid))
			await this.redis.del(this.getPlayerRedisKey('is_active', uuid))
		}
	}
})