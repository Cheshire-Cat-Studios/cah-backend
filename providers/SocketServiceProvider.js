const ServiceProvider = require('./ServiceProvider'),
	{Server} = require('socket.io'),
	cors = require('../config/cors.js'),
	{verify, sign} = require('jsonwebtoken'),
	socketIoModule = require('../modules/socket-io'),
	redis_client = require('../modules/redis'),
	user_deck = require('../config/decks/whiteCards'),
	game_deck = require('../config/decks/blackCards'),
	shuffle = require('lodash.shuffle'),
	JSON5 = require('json5'),
	Game = require('../models/Game'),
	User = require('../models/User'),
	endGame = require('../modules/game-logic/utility/end-game'),

	//TODO: replace with {} require
	initialisation = require('../modules/game-logic/initialisation'),
	cardChosen = require('../modules/game-logic/card-chosen'),
	czarChosen = require('../modules/game-logic/czar-chosen'),
	disconnect = require('../modules/game-logic/disconnect'),
	startGame = require('../modules/game-logic/start-game')


// User = require('../models/User')

module.exports = class AppServiceProvider extends ServiceProvider {
	constructor(app) {
		super(app)

		this.io = null
	}

	handle() {
		//TODO: modularise server?
		const io = socketIoModule
			.initialise(this.app.globals.server)
			.applyMiddleware()
			.io

		io.on(
			'connection',
			async socket => {
				const game_redis_keys = {
						state: `game.${socket.user.current_game}.state`,
						deck: `game.${socket.user.current_game}.deck`,
						players: `game.${socket.user.current_game}.players`,
						cards_in_play: `game.${socket.user.current_game}.cards_in_play`,
					},
					player_redis_keys = {
						deck: `players.${socket.user.uuid}.deck`,
						hand: `players.${socket.user.uuid}.hand`,
						is_active: `players.${socket.user.uuid}.is_active`,
					},
					redis_keys = {
						game: game_redis_keys,
						player: player_redis_keys,
					}

				initialisation(io, socket, redis_keys)

				socket.on(
					'cards-chosen',
					data => {
						cardChosen(io, socket, redis_keys, data)
					}
				)

				socket.on(
					'czar-chosen',
					uuid => {
						czarChosen(io, socket, redis_keys, uuid)
					}
				)

				socket.on(
					'start-game',
					async () => {
						startGame(io,socket,redis_keys)
					}
				)

				socket.on(
					'disconnect',
					async () => {
						//TODO: if game not started just delete entire player redis store and remove game association
						await redis_client.set(redis_keys.player.is_active, 'false')

						setTimeout(
							async () => {
								if (JSON.parse(await redis_client.get(redis_keys.player.is_active))) {
									return
								}

								//TODO: re-impliment
								// disconnect(io, socket, redis_keys)
							},
							2000//TODO: change to config or env val
						)
					}
				)

				socket.on(
					'leave',
					() => {
						disconnect(io, socket, redis_keys)
					}
				)
			}
		)
	}
}