const {RedisConnection} = require('jester')

module.exports = async (socket_id, game_id, user_id, event_key, event_data = []) => {
	const data = {
			socket_id,
			game_id,
			user_id,
			event_key,
			event_data
		},
		redis_client = await RedisConnection.getClient()

	await redis_client.rPush(
		`game.${game_id}.events-queue`,
		JSON.stringify(data)
	)
}

