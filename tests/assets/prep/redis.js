const {redis_client} = require('jester').modules

module.exports = async () => {
	await redis_client.flushAll()
}