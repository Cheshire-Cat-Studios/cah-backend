const sendJsend = require('../helpers/sendJsend'),
	Query = require('../database/query/Query'),
	createUniqueId = require('../helpers/createUniqueId'),
	faker = require('faker')

//TODO: move get method into custom auth middleware
module.exports = {
	get(req, res) {
		console.log('hit')
		const user = (new Query)
			.setTable('users')
			.whereEquals('uuid', req.params.userId)
			.whereEquals('secret', req.params.secret)
			.first()

		user
			? sendJsend(res, 200, 'success', {
				userId: user.id,
				secret: user.secret,
				gameId: null //user.game_data.current_game
			})
			: sendJsend(res, 400, 'error', {})
	},
	create(req, res) {
		try {
			const user = (new Query)
				.setTable('users')
				.create({
					id: null,
					uuid: createUniqueId('user'),
					name: req.body.name,
					secret: faker.random.alpha(25),
				})


			sendJsend(res,200, 'success', {
				userId: user.uuid,
				secret: user.secret,
				gameId: null
			})
		} catch (e) {
			sendJsend(res,422, 'error', {
				errors: [
					{
						field: 'player_name',
						msg: 'That player name is already in use, please chose another'
					}
				]
			})
		}
	}
}