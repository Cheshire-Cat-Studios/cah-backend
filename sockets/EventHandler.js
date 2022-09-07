const
	{RedisConnection} = require('jester'),
	getUserRedisKey = require('../helpers/getRedisKey/user'),
	pushToQueue = require('../queue/push-to-queue'),
	//TODO: abstract into config
	mappings = [
		'leave',
		'error',
		'start-game',
		'czar-chosen',
		'cards-chosen',
		'disconnect'
	]

module.exports = class EventHandler {
	setSocket(socket) {
		this.socket = socket

		return this
	}

	handle() {
		for (const mapping of mappings) {
			this.socket.on(
				mapping,
				async (...data) => {
					console.log('set true')
					console.log(getUserRedisKey('is_active', this.socket.user.id))
					await (await RedisConnection.getClient()).set(
						getUserRedisKey('is_active', this.socket.user.id),
						'true'
					)

					await pushToQueue(
						this.socket.id,
						this.socket.user.current_game,
						this.socket.user.id,
						mapping,
						[...data]
					)
				}
			)
		}
	}
}


// (socket_id, game_id, event_key, event_data)