//TODO: rethink structure, perhaps a modules folder or stateful folder is needed? going the module route makes a lot more sense for node.js
const redis = require('redis'),
	redisClient = redis.createClient({
		port: 6379,
		host: 'localhost'
	})

let is_connected = false;


(async () => {
	if(!is_connected){
		await redisClient.connect()
	}

	is_connected = true
})()

module.exports = redisClient
