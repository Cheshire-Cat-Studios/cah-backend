module.exports = class CahListener {
	socket = null
	io = null
	keys = require('../../../config/redis/keys')

	setRedis(redis){
		this.redis = redis

		return this
	}

	setSocket(socket) {
		this.socket = socket

		return this
	}

	setIo(io) {
		this.io = io

		return this
	}

	getPlayerRedisKey(key, player_uuid) {
		return this.keys
			.player
			[key]
			?.replace('#', player_uuid || this.socket.user.id)
	}

	getGameRedisKey(key) {
		return this.keys
			.game
			[key]
			?.replace('#', this.socket.user.current_game)
	}
}