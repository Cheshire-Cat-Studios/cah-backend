module.exports = class CahListener {
	socket = null
	io = null
	keys = require('../../../config/redis/keys')

	setSocket(socket) {
		this.socket = this.socket

		return this
	}

	setIo(io) {
		this.io = this.io

		return this
	}

	getPlayerRedisKey(key, player_uuid) {
		return this.keys
			.player
			[key]
			?.replace('#', player_uuid || this.socket.user.uuid)

	}

	getGameRedisKey(key) {
		return this.keys
			.game
			[key]
			?.replace('#', this.socket.user.current_game)
	}
}