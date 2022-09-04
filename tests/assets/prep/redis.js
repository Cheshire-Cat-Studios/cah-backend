const {RedisConnection} = require('jester')

module.exports = async () => {
	await (
		await RedisConnection.getClient()
	)
		.flushAll()
}