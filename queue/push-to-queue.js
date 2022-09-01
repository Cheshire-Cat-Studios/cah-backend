const {redis_client} = require('jester').modules

module.exports = async (socket_id, game_id, event_key, event_data = []) => {
	console.log(5555)

	const data = {
		socket_id,
		game_id,
		event_key,
		event_data
	}


	await redis_client.rPush(
		`game.${game_id}.events-queue`,
		JSON.stringify(data)
	)

	console.log(666)
}

