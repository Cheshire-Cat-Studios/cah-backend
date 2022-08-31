const redis_client = require('../../../modules/redis')

module.exports = async () => {
	await redis_client.flushAll()
}