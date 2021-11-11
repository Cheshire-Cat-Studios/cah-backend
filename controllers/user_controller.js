const sendJsend = require('../helpers/sendJsend'),
	Query = require('../database/query/Query'),
	User = require('../models/User'),
	createUniqueId = require('../helpers/createUniqueId'),
	faker = require('faker'),
	{verify, sign} = require('jsonwebtoken')

//TODO: move get method into custom auth middleware
module.exports = {
	// get(req, res) {
	// 	const user = (new Query)
	// 		.setTable('users')
	// 		.whereEquals('uuid', req.params.userId)
	// 		.whereEquals('secret', req.params.secret)
	// 		.first()
	//
	// 	user
	// 		? sendJsend(res, 200, 'success', {
	// 			userId: user.id,
	// 			secret: user.secret,
	// 			gameId: null
	// 		})
	// 		: sendJsend(res, 400, 'error', {})
	// },
	create(req, res) {
		try {
			const user = new User()
				.create({
					id: null,
					uuid: createUniqueId('user'),
					name: req.body.name,
					secret: faker.random.alpha(25),
				})

			const token = sign(
				{uuid: user.row.uuid},
				process.env.JWT_ACCESS_TOKEN_SECRET
			)

			sendJsend(res, 200, 'success', {
				token,
			})
		} catch (e) {
			sendJsend(res, 422, 'error', {
				errors: [
					{
						field: 'player_name',
						msg: 'That player name is already in use, please chose another'
					}
				]
			})
		}
	},
	verify(req, res) {
		sendJsend(
			res,
			200,
			'success',
			{
				in_game: !!req.user_model.row.current_game
			}
		)
	}
}