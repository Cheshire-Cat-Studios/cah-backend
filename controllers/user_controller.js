const sendJsend = require('../helpers/sendJsend'),
	Query = require('../database/query/Query'),
	User = require('../models/User'),
	createUniqueId = require('../helpers/createUniqueId'),
	faker = require('faker'),
	{verify, sign} = require('jsonwebtoken')

//TODO: move get method into custom auth middleware
module.exports = {
	async create(req, res) {
		try {
			const user = await new User()
				.create({
					// id: null,
					uuid: createUniqueId('user'),
					name: req.body.name,
				})

			const token = sign(
				{uuid: user.row.uuid},
				process.env.JWT_ACCESS_TOKEN_SECRET,
				{
					expiresIn: parseInt(process.env.JWT_ACCESS_TOKEN_LIFE)
				}
			)

			sendJsend(res, 200, 'success', {
				token,
			})
		} catch (e) {
			console.log(e)
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
		const token = sign(
			{uuid: req.user_model.row.uuid},
			process.env.JWT_ACCESS_TOKEN_SECRET,
			{
				expiresIn: parseInt(process.env.JWT_ACCESS_TOKEN_LIFE)
			}
		)

		sendJsend(
			res,
			200,
			'success',
			{
				in_game: !!req.user_model.row.current_game,
				token: token
			}
		)
	}
}