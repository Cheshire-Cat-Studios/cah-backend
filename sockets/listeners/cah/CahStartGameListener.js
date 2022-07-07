const
	CahListener = require('./CahListener'),
	Game = require('../../../models/Game')

module.exports = class CahStartGameListener extends CahListener {
	async handle() {
		const game = await new Game()
			.whereEquals('id', this.socket.user.current_game)
			.first()

		if (
			this.socket.user.id !== game?.row?.host_id
		) {
			return
		}

		const czar = (
			await game.players()
				.handle()
				.orderBy('RAND()')
				.first()
		)
			.row
			.uuid

		this.redis.hSet(this.getGameRedisKey('state'), 'current_czar', czar)
		this.redis.hSet(this.getGameRedisKey('state'), 'is_started', 'true');

		(await this.io.in('game.' + this.socket.user.current_game).fetchSockets())
			.forEach(user_socket => {
				user_socket.emit(
					'game-started',
					{
						is_czar: user_socket.user.uuid === czar
					}
				)
			})
	}
}