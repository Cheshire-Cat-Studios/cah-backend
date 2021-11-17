const sendJsend = require('../helpers/sendJsend'),
	Query = require('../database/query/Query'),
	Game = require('../models/Game'),
	createUniqueId = require('../helpers/createUniqueId'),
	EventEmitter =  require('../modules/event-handler')

	module.exports = {

	index(req, res) {
		//TODO: add filter logic here, should be a doddle with the orm
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
		let game = null

		if(req.user_model.current_game){
			sendJsend(
				res,
				400,
				'error',
				{}
			)

			return
		}

		req.params.game_uuid
		&& (
			game = new Game()
				.whereEquals('uuid', req.params.game_uuid)
				.first()
		)

		if (!req.params.game_uuid || !game) {
			sendJsend(res, 404, 'error', {})

			return
		}

		if (
			game.password
			&& game.password !== req.body.password
		) {
			sendJsend(
				res,
				400,
				'error',
				{
					password: 'That password is incorrect'
				}
			)

			return
		}

		if (
			game.players()
				.handle()
				.count()
			>= game.row.max_players
		) {
			sendJsend(
				res,
				400,
				'error',
				{
					max_players: 'That game is now full, please choose another'
				}
			)

			return
		}

		req.user_model
			.joinGame(game)

		sendJsend(
			res,
			200,
			'success',
			{}
		)
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
			.joinGame(game)

		//TODO: Should this even be an event, makes more sense to do it synchronously?
		 EventEmitter.emit('game_created', game.row)

		sendJsend(
			res,
			200,
			'success',
			{}
		)
	}
}