const
	SocketsBuilder = require('../SocketsBuilder'),
	CahCardsChosenListener = require('../../listeners/cah/CahCardsChosenListener'),
	CahCzarChosenListener = require('../../listeners/cah/CahCzarChosenListener'),
	CahDisconnectListener = require('../../listeners/cah/CahDisconnectListener'),
	CahInitialiseGameListener = require('../../listeners/cah/CahInitialiseGameListener'),
	CahStartGameListener = require('../../listeners/cah/CahStartGameListener.js')

module.exports = class CahSocketsBuilder extends SocketsBuilder {
	mappings = {
		'leave': CahDisconnectListener,
		'error': CahDisconnectListener,
		'start-game': CahStartGameListener,
		'czar-chosen': CahCzarChosenListener,
		'cards-chosen': CahCardsChosenListener
	}

	// async socketDisconnect() {
	// 	//TODO: if game not started just delete entire player redis store and remove game association
	// 	// await redis_client.set(redis_keys.player.is_active, 'false')
	// 	//
	// 	// setTimeout(
	// 	// 	async () => {
	// 	// 		if (JSON.parse(await redis_client.get(redis_keys.player.is_active))) {
	// 	// 			return
	// 	// 		}
	// 	//
	// 	// 		//TODO: re-impliment
	// 	// 		// disconnect(io, socket, redis_keys)
	// 	// 	},
	// 	// 	2000//TODO: change to config or env val
	// 	// )
	// }

	handle() {
		(new CahInitialiseGameListener)
			.setSocket(this.socket)
			.setIo(this.io)
			.handle()

		for (const key in this.mappings) {
			this.socket.on(
				key,
				(...data) => {
					(new this.mappings[key]())
						.setSocket(this.socket)
						.setIo(this.io)
						.handle(...data)
				}
			)
		}

	}
}