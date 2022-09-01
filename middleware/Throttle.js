const Middleware = require('./Middleware'),
	redisClient = require('../modules/redis'),
	moment = require('moment')

module.exports = class Throttle extends Middleware {
	constructor(request_limit = 10, limit_window_secs = 60) {
		super()

		this.request_limit = request_limit
		this.limit_window_secs = limit_window_secs
	}

	async handle() {
		const redis_key = `rate-limit${this.req.path}|${this.req.ip}`,
			now = moment.utc().unix()

		await redisClient.lPush(redis_key, `${now}`)
		await redisClient.lTrim(redis_key, 0, this.request_limit)

		const redis_log = await redisClient.lRange(redis_key, 0, -1)
		//converting it to one line breaks everything
		const request_history = redis_log.filter(timestamp => timestamp >= (now - this.limit_window_secs));

		//TODO: add expiry for the list after the window limit, dont need to permanently store ip logs if they're outside the window
		(request_history.length >= this.request_limit)
			? this.sendJsend(400, 'error', {message: 'Rate limit exceeded'})
			: this.next()
	}
}