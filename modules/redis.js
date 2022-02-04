//TODO: rethink structure, perhaps a modules folder or stateful folder is needed? going the module route makes a lot more sense for node.js
const redis = require('redis'),
	redis_client = redis.createClient({
		port: process.env.REDIS_PORT,
		url: process.env.REDIS_HOST,
	})

let is_connected = false;


(async () => {
	if(!is_connected){
		await redis_client.connect()
	}

	is_connected = true
})()

module.exports = redis_client
