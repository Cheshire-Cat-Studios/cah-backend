const {redis_client} = require('jester').modules

module.exports = async () => {
	const {server, io} = require('../server')

	await redis_client.quit()
	await server.close()

	console.log('dead')
}