const Middleware = require('./Middleware'),
	redisClient = require('../helpers/redis'),
	moment = require('moment'),
	sendJsend = require('../helpers/sendJsend')

module.exports = class Throttle extends Middleware {
	constructor(request_limit = 10, limit_window_secs = 60) {
		super()

		this.request_limit = request_limit
		this.limit_window_secs = limit_window_secs
	}

	async handle(req, res, next) {

		const redis_key = `rate-limit${req.path}|${req.ip}`,
			now = moment.utc().unix()


		await redisClient.lPush(redis_key, `${now}`)
		await redisClient.lTrim(redis_key, 0, this.request_limit)


		const redis_log = await redisClient.lRange(redis_key, 0, -1),
			request_history = redis_log.filter(timestamp => timestamp >= (now - this.limit_window_secs))


		console.log(request_history, (now - this.limit_window_secs));

		(request_history.length >= this.request_limit)
			? sendJsend(res, 400, 'error', 'THROTTLED BIATCH')
			: next()
	}
}