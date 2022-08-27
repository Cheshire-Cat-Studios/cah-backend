const getUserRedisKey = require('../../../../../../helpers/getRedisKey/user'),
	redis_client = require('../../../../../../modules/redis')

module.exports = async (user, draw_count = 10) => {
	await redis_client.lPush(
		getUserRedisKey('hand', user.row.uuid),
		//LPOP node-redis method doesnt allow for length being specified
		await redis_client.sendCommand([
			'LPOP',
			getUserRedisKey('deck', user.row.uuid),
			draw_count,
		]),
	)
}


