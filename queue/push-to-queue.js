const redis_client = require('../modules/redis')

module.exports = async (socket_id, game_id, event_key, event_data = []) => {
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
}

