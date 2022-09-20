import {RedisConnection} from '@cheshire-cat-studios/jester'

export default async (
	socket_id: string,
	game_id: string | number,
	user_id: string | number,
	event_key: string,
	event_data: any = []
): Promise<void> => {
	const data = {
			socket_id,
			game_id,
			user_id,
			event_key,
			event_data
		},
		redisClient = await RedisConnection.getClient()

	await redisClient.rPush(
		`game.${game_id}.events-queue`,
		JSON.stringify(data)
	)
}

