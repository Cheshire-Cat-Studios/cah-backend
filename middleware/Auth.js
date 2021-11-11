const Middleware = require('./Middleware'),
	{verify, sign} = require('jsonwebtoken'),
	User = require('../models/User'),
	sendJsend = require('../helpers/sendJsend')


module.exports = class Auth extends Middleware {
	handle(req, res, next) {

		const token = req.headers['authorization'].split(' ')

		if (token[0] === 'Bearer') {
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
		}

		sendJsend(res, 403, 'error', {message: 'Unauthorised access'})
	}
}