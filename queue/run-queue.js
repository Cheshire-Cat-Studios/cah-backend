const
	CahDisconnectListener = require('../sockets/listeners/cah/CahDisconnectListener'),
	CahLeaveListener = require('../sockets/listeners/cah/CahLeaveListener'),
	CahStartGameListener = require('../sockets/listeners/cah/CahStartGameListener'),
	CahCzarChosenListener = require('../sockets/listeners/cah/CahCzarChosenListener'),
	CahCardsChosenListener = require('../sockets/listeners/cah/CahCardsChosenListener'),
	CahInitialiseGameListener = require('../sockets/listeners/cah/CahInitialiseGameListener'),
	{RedisConnection} = require('jester'),
	User = require('../models/User')

//TODO: abstract into config
mappings = {
	'initialise': CahInitialiseGameListener,
	'leave': CahLeaveListener,
	'disconnect': CahDisconnectListener,
	'error': CahDisconnectListener,
	'start-game': CahStartGameListener,
	'czar-chosen': CahCzarChosenListener,
	'cards-chosen': CahCardsChosenListener
}

module.exports = async (game_id, only_run_once = false, timeout_ms = 100, batch_size = 10) => {
	const redis_client = await RedisConnection.getClient()

	while (true) {
		const {io} = require('../server')

		if (
			!await redis_client.exists(`game.${game_id}.state`)
		) {
			break
		}

		let batch = (
			await redis_client.sendCommand([
				'LPOP',
				`game.${game_id}.events-queue`,
				batch_size+'',
			])
		)

		if (batch?.length) {
			for (const event_string of batch) {
				const {socket_id, user_id, game_id, event_key, event_data} = JSON.parse(event_string),
					socket = io.sockets.sockets.get(socket_id)

				console.log(
					socket_id,
					user_id,
					game_id,
					event_key,
					event_data
				)


				await (new mappings[event_key])
					.setSocket(
						socket
						|| {
							user: (await new User().find(user_id)).row
						}
					)
					.setIo(io)
					.setRedis(redis_client)
					.handle(...event_data, user_id)
			}
		}

		if (only_run_once) {
			break
		} else {
			await new Promise(
				resolve => setTimeout(resolve, timeout_ms)
			)
		}
	}
}

 