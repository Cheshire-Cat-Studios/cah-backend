const getUserRedisKey = require('../../../../../../helpers/getRedisKey/user'),
	{redis_client} = require('jester').modules

module.exports = async (user, draw_count = 10) => {
	await redis_client.lPush(
		getUserRedisKey('hand', user.row.uuid),
		await redis_client.sendCommand([
			'LPOP',
			getUserRedisKey('deck', user.row.uuid),
			draw_count+'',
		]),
	)
}


