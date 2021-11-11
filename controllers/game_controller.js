const sendJsend = require('../helpers/sendJsend'),
	DatabaseService = require('../services/DatabaseService'),
	Query = require('../database/query/Query'),
	Game = require('../models/Game'),
	createUniqueId = require('../helpers/createUniqueId')

module.exports = {

	index(req, res) {
		sendJsend(
			res,
			200,
			'success',
			{
				games: (new Query)
					.setTable('games')
					.get()
			}
		)
	},

	join(req, res) {

		const user = (new Query).setTable('users')
			.whereEquals('uuid', req.body.user.id)
			.whereEquals('secret', req.body.user.secret)
			.first()

		!user
		&& sendJsend(
			res,
			422,
			'error',
			{
				'errors': [{field: 'user', msg: 'user is invalid'}]
			})


		const game = (new Query)
			.setTable('games')
			.whereEquals('uuid', req.body.game.uuid)
			.whereGroup(query => {
				query()
					.whereEquals('password', req.body.game_uuid)
					.orWhereEquals('password', null)
			})
			.first()

		//TODO: db transaction
		if (game) {
			!game.config.password || game.config.password === req.body.game_password
				? (
					game.addUser(user)
						? sendJsend(res, 200, 'success', {})
						: sendJsend(res, 200, 'error', {'errors': [{field: 'game', msg: 'game is full'}]})
				)
				: sendJsend(res, 422, 'error', {'errors': [{field: 'password', msg: 'password is invalid'}]})
		} else {
			sendJsend(res, 400, 'error', {'errors': [{field: 'game', msg: 'game is invalid'}]})
		}
	},

	create(req, res) {
		if (req.user_model.row.current_game) {
			sendJsend(
				res,
				422,
				'error',
				{
					errors: {
						host: 'You are in a game already! Please leave or complete if before creating another',
					}
				}
			)

			return
		}

		const game = new Game()
			.create({
				id: null,
				is_started: 0,
				is_czar_phase: 0,
				host_id: req.user_model.row.id,
				uuid: createUniqueId('game'),
				...req.validated_data
			})

		req.user_model
			.update({
				current_game: game.row.id
			})

		sendJsend(
			res,
			200,
			'success',
			{}
		)
	}
}