const
	CahListener = require('./CahListener'),
	{EventHandler} = require('jester'),
	//TODO: abstract into config
	timeout = 20000 //20 seconds

module.exports = class CahDisconnectListener extends CahListener {
	async handle() {
		if(!this.socket.user.current_game){
			return
		}


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