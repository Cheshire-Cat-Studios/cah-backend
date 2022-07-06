const SocketsBuilder = require('./SocketsBuilder'),
	cardChosen = require('../modules/game-logic/card-chosen'),
	czarChosen = require('../modules/game-logic/czar-chosen'),
	startGame = require('../modules/game-logic/start-game'),
	redis_client = require('../modules/redis'),
	disconnect = require('../modules/game-logic/disconnect')

module.exports = class CahSocketsBuilder extends SocketsBuilder {
	mappings = {
		'leave': 'disconnect',
		'error': 'disconnect',
		'start-game': 'startGame',
		'czar-chosen': 'czarChosen',
		'cards-chosen': 'cardsChosen'
	}

	async socketDisconnect() {
		//TODO: if game not started just delete entire player redis store and remove game association
		await redis_client.set(redis_keys.player.is_active, 'false')

		setTimeout(
			async () => {
				if (JSON.parse(await redis_client.get(redis_keys.player.is_active))) {
					return
				}

				// console.log(123)
				//TODO: re-impliment
				// disconnect(io, socket, redis_keys)
			},
			2000//TODO: change to config or env val
		)
	}

	handle() {
		const keys = this.prepareKeys()

		for (const key in this.mappings) {
			this.socket.on(
				key,
				(...data) => {
					(new mappings[key]())
						// .setKeys(keys)
						.setSocket()
						.handle(...data)
				}
			)
		}

	}
}