const
	{
		Event,
		RedisConnection
	} = require('jester'),
	pushToQueue = require('../queue/push-to-queue'),
	getUserKey = require('../helpers/getRedisKey/user'),

//TODO: abstract into config
	timeout = 5000

module.exports = class UserLeft extends Event {
	constructor() {
		super('user-left', true)
	}

	async handle(socket_id, user_id, game_id) {
		const redis_client = await RedisConnection.getClient()

		await new Promise(
			resolve => setTimeout(resolve, timeout)
		)

		const is_active = await redis_client.get(getUserKey('is_active', user_id))

		if(is_active && JSON.parse(is_active)){
			return
		}

		await pushToQueue(
			socket_id,
			game_id,
			user_id,
			'leave'
		)
	}
}