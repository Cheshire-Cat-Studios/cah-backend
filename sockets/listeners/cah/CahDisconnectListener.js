const
	CahListener = require('./CahListener'),
	{EventHandler} = require('jester'),
	//TODO: abstract into config
	timeout = 20000 //20 seconds

module.exports = class CahLeaveListener extends CahListener {
	async handle() {
		await this.redis.set(
			this.getPlayerRedisKey('is_active'),
			'false'
		)

		EventHandler
			.emit(
				'user-left',
				this.socket.id,
				this.socket.user.id,
				this.socket.user.current_game
			)
	}
}