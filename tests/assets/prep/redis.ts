import {RedisConnection} from '@cheshire-cat-studios/jester'

export default async () => {
	await (
		await RedisConnection.getClient()
	)
		.flushAll()
}