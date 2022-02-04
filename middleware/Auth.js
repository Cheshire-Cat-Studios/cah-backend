const Middleware = require('./Middleware'),
	{verify, sign} = require('jsonwebtoken'),
	User = require('../models/User'),
	sendJsend = require('../helpers/sendJsend'),
	redis_client = require('../modules/redis')


module.exports = class Auth extends Middleware {
	async handle(req, res, next) {
		const token = req.headers?.['authorization']?.split(' ')

		if (token?.[0] === 'Bearer') {
			try {
				const uuid = verify(token[1], process.env.JWT_ACCESS_TOKEN_SECRET).uuid,
					user = new User()
						.whereEquals('uuid', uuid)
						.first()

				if (user) {
					//todo: theres got to be a better way to do this?
					req.user_model = user

					next()
					return
				}

			} catch (e) {
				if (e.name === 'TokenExpiredError') {
					const uuid = verify(
							token[1],
							process.env.JWT_ACCESS_TOKEN_SECRET,
							{ignoreExpiration: true}
						)
							.uuid,
						user = new User()
							.whereEquals('uuid', uuid)
							.first(),
						active = await redis_client.get(`players.${user.row.uuid}.is_active`)

					if(active && JSON.parse(active)){
						req.user_model = user

						next()
						return
					}

				}
			}
		}

		sendJsend(res, 403, 'error', {message: 'Unauthorised access'})
	}
}