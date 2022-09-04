const {RedisConnection} = require('jester')

module.exports = async () => {
	const {server, io} = require('../server')

	await (
		await RedisConnection.getClient()
	)
		.disconnect()

	await server.close()

	console.log('dead')
}