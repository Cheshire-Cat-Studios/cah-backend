const Controller = require('./Controller'),
	Game = require('../models/Game'),
	User = require('../models/User')

module.exports = class GameController extends Controller {
	index() {
		const games = (new Game).get()

		this.sendJsend(
			200,
			'success',
			{
				games
			}
		)
	}

	join() {
		const user = (new User)
			.whereEquals('uuid', req.body.user.id)
			.whereEquals('secret', req.body.user.secret)
			.first()

		!user
		&& this.sendJsend(
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
	}

,

	create(req, res) {
		const host = this.app.globals.users.getUser(req.body.host, req.body.secret)

		if (!host) {
			res.sendJsend(422, 'error', {'errors': [{field: 'host', msg: 'host is invalid'}]})
		}

		const game = this.app.globals.games.addGame(req.body.name, host, req.body.config)

		if (game instanceof Game) {
			host.assignGame(game)

			res.sendJsend(200, 'success', {
				game: {
					id: game.id,
					password: game.config.password
				}
			})
		} else {
			res.sendJsend(422, 'error', {
				errors: [
					{
						field: 'name',
						msg: 'That game name is already in use, please chose another'
					}
				]
			})
		}
	}
}