const redis_client = require('../modules/redis')

module.exports = async () => {
	const {server, io} = require('../server')

	await redis_client.quit()
	await server.close()

	console.log('dead')
}