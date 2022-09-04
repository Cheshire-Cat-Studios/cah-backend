const
	{Middleware} = require('jester'),
	{verify, sign} = require('jsonwebtoken'),
	User = require('../models/User'),
	sendJsend = require('../helpers/sendJsend'),
	{RedisConnection} = require('jester')


module.exports = class Auth extends Middleware {
	async handle() {
		const redis_client = await RedisConnection.getClient(),
			token = this.req.headers?.['authorization']?.split(' ')

		if (token?.[0] === 'Bearer') {
			try {
				const uuid = verify(token[1], process.env.JWT_ACCESS_TOKEN_SECRET).uuid,
					user = await new User()
						.whereEquals('uuid', uuid)
						.first()

				if (user) {
					//todo: theres got to be a better way to do this?
					this.req.user_model = user

					this.next()
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
						user = await new User()
							.whereEquals('uuid', uuid)
							.first(),
						active = user && JSON.parse(await redis_client.get(`players.${user.row.uuid}.is_active`))

					if (active) {
						this.req.user_model = user

						this.next()
						return
					}

				}
			}
		}

		this.sendJsend(403, 'error', {message: 'Unauthorised access'})
	}
}