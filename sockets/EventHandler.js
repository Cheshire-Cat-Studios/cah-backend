const
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
				(...data) => {
					pushToQueue(
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