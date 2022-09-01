//TODO: Currently just referencing the jester package will create redis connection, this need to be reworked into a class or json module
const redis = require('redis'),
	fs = require('fs'),
	tls = !!process.env.REDIS_TLS_FILENAME,
	redis_client = redis.createClient({
		//DOCKER
		socket: {
			port: process.env.REDIS_PORT,
			host: process.env.REDIS_HOST,
			tls,
			cert: tls
				? fs.readFileSync(`./certs/${process.env.REDIS_TLS_FILENAME}`, 'ascii')
				: undefined
		},
		username: process.env.REDIS_USERNAME,
		password: process.env.REDIS_PASSWORD,
	})


let is_connected = false;


(async () => {
	if (!is_connected) {
		await redis_client.connect()
	}

	is_connected = true
})()

module.exports = redis_client
