//TODO: url is insecure, consider how i can use host with dev details
const redis = require('redis'),
	redis_client = redis.createClient({
		url: process.env.REDIS_CRED_STR,
		// port: process.env.REDIS_PORT,
		// host: process.env.REDIS_HOST,
		// username: process.env.REDIS_USERNAME,
		// password: process.env.REDIS_PASSWORD,
		// tls: process.env.REDIS_TLS == 'true' ? true : false,
	})

let is_connected = false;


(async () => {
	if(!is_connected){
		await redis_client.connect()
	}

	is_connected = true
})()

module.exports = redis_client
