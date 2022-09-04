const getUserRedisKey = require('../../../../../../helpers/getRedisKey/user'),
	{RedisConnection} = require('jester')

module.exports = async (user, draw_count = 10) => {
	const redis_client = await RedisConnection.getClient()

	await redis_client.lPush(
		getUserRedisKey('hand', user.row.uuid),
		await redis_client.sendCommand([
			'LPOP',
			getUserRedisKey('deck', user.row.uuid),
			draw_count + '',
		]),
	)
}


