const redis = require('redis'),
	fs = require('fs'),
	path = require('path')

module.exports = class RedisConnection {
	static redis_client = null

	static async getClient() {
		!RedisConnection.redis_client
		&& await RedisConnection.createClient()

		return RedisConnection.redis_client
	}

	static async createClient() {
		const tls = !!process.env.REDIS_TLS_FILENAME,
			cert_path = path.join(
				process.cwd(),
				'/certs/' + process.env.REDIS_TLS_FILENAME
			)

		RedisConnection.redis_client = await redis.createClient({
			socket: {
				port: process.env.REDIS_PORT,
				host: process.env.REDIS_HOST,
				tls,
				cert: tls
					? fs.readFileSync(
						cert_path,
						'ascii'
					)
					: undefined
			},
			username: process.env.REDIS_USERNAME,
			password: process.env.REDIS_PASSWORD,
		})

		await RedisConnection.redis_client.connect()
	}
}