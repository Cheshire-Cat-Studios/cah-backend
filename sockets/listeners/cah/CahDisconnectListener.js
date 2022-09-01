const
	CahListener = require('./CahListener'),
	{event_handler} = require('jester').modules,
	//TODO: abstract into config
	timeout = 20000 //20 seconds

module.exports = class CahLeaveListener extends CahListener {
	async handle() {
		await this.redis.set(
			this.getPlayerRedisKey('is_active'),
			'false'
		)

		event_handler
			.emit(
				'user-left',
				this.socket.id,
				this.socket.user.id,
				this.socket.user.current_game
			)
	}
}