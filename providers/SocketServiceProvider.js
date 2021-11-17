const ServiceProvider = require('./ServiceProvider'),
	{Server} = require('socket.io'),
	cors = require('../config/cors.js'),
	{verify, sign} = require('jsonwebtoken'),
	socketIoModule = require('../modules/socket-io'),
	redis_client = require('../modules/redis'),
	user_deck = require('../config/decks/whiteCards'),
	shuffle = require('lodash.shuffle'),
	JSON5 = require('json5')

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
			.on(
				'connection',
				async socket => {
					//TODO: build individual modules for init and various listeners etc, will help keep this shit tidy
					console.log('connected')
					console.log('initialisation')
					console.log('------------------------------------------------------------------------------------------------')
					//LRANGE KEY 0 -1 - gets first record

					const game_redis_keys = {
							state: `game.${socket.user.current_game}.state`,
							deck: `game.${socket.user.current_game}.deck`,
							players: `game.${socket.user.current_game}.players`,
							cards_in_play: `game.${socket.user.current_game}.cards_in_play`,
						},
						player_redis_keys = {
							deck: `players.${socket.user.uuid}.deck`,
							hand: `players.${socket.user.uuid}.hand`,
						}

					!await redis_client.hExists(game_redis_keys.players, socket.user.uuid)
					&& await redis_client.hSet(
						game_redis_keys.players,
						socket.user.uuid,
						`{score:0,name:'${socket.user.name}'}`
					)

					!await redis_client.hGet(game_redis_keys.state, 'current_czar')
					&& await redis_client.hLen(game_redis_keys.players) === 1
					&& await redis_client.hSet(game_redis_keys.state, 'current_czar', socket.user.uuid)

					!await redis_client.exists(player_redis_keys.deck)
					&& await redis_client.lPush(player_redis_keys.deck, shuffle(user_deck))

					!await redis_client.exists(player_redis_keys.hand)
					&& await redis_client.lPush(
						player_redis_keys.hand,
						//LPOP node-redis method doesnt allow for length being specified
						await redis_client.sendCommand([
							'LPOP',
							player_redis_keys.deck,
							'10',
						]),
					)

					const current_czar = await redis_client.hGet(game_redis_keys.state, 'is_czar_phase'),
						redis_players = await redis_client.hGetAll(game_redis_keys.players),
						parsed_players = Object.keys(redis_players)
							.map(uuid => {
								const data = JSON5.parse(redis_players[uuid])

								uuid === current_czar
								&& (data.is_czar = true)

								return data
							})

					socket.join('game.' + socket.user.current_game)

					const is_czar_phase = JSON.parse(await redis_client.hGet(game_redis_keys.state, 'is_czar_phase')),
						game_data = {
							players: parsed_players,
							is_czar_phase: JSON.parse(await redis_client.hGet(game_redis_keys.state, 'is_czar_phase')),
							current_card: (await redis_client.lRange(game_redis_keys.deck, 0, 0))[0],
							is_current_czar: socket.user.uuid === await redis_client.hGet(game_redis_keys.state, 'current_czar'),
						}


					if (is_czar_phase) {
						game_data.cards_in_play = await redis_client.hGetAll(game_redis_keys.cards_in_play)
					} else {
						const player_cards_in_play = await redis_client.hGet(game_redis_keys.cards_in_play, socket.user.uuid),
							in_play_count = await redis_client.hLen(game_redis_keys.cards_in_play, socket.user.uuid)

						game_data.own_cards_in_play = JSON.parse(player_cards_in_play)
						game_data.cards_in_play_count = player_cards_in_play ? (in_play_count - 1) : in_play_count
					}


					//build user hand and deck
					socket.emit(
						'game-state',
						{
							game: game_data,
							hand: await redis_client.lRange(player_redis_keys.hand, 0, -1),
						}
					)


					console.log('------------------------------------------------------------------------------------------------')

					console.log('card-chosen (not czar)')
					console.log('------------------------------------------------------------------------------------------------')

					socket.on(
						'cards-chosen',
						async data => {
							const card_count = ((await redis_client.lRange(game_redis_keys.deck, 0, 0))[0].match(/_/g) || [1]).length,
								deleted_placeholder = '(*&^%$RFGHJU)afea',
								current_czar_uuid = await redis_client.hGet(game_redis_keys.state, 'current_czar')

							console.log('card-chosen (not czar)')


							let cards = []

							// if user is current czar, is currently the czar phase, already chosen cards, data isn't an array, data contains non ints, data isn't a unique set. return and ignore event
							if (
								current_czar_uuid === socket.user.uuid
								|| JSON.parse(await redis_client.hGet(game_redis_keys.state, 'is_czar_phase'))
								|| await redis_client.hExists(game_redis_keys.cards_in_play, socket.user.uuid)
								|| !Array.isArray(data)
								|| data.filter(datum => typeof (datum) !== 'number').length
								|| new Set(data).size !== data.length
								|| data.length !== card_count
							) {
								return
							}

							for (const index of data) {
								cards.push(await redis_client.lIndex(player_redis_keys.hand, `${index}`))
							}

							console.log(cards)

							if (cards.filter(card => !card).length) {
								return
							}

							for (const index of data) {
								await redis_client.lSet(player_redis_keys.hand, `${index}`, deleted_placeholder)
							}

							await redis_client.lRem(player_redis_keys.hand, card_count, deleted_placeholder)
							await redis_client.hSet(game_redis_keys.cards_in_play, socket.user.uuid, JSON.stringify(cards))

							// console.log(await redis_client.hKeys(game_redis_keys.players))

							if (await redis_client.hLen(game_redis_keys.cards_in_play) === (await redis_client.hLen(game_redis_keys.players)) - 1) {
								console.log(
									'FAIL',
									await redis_client.hLen(game_redis_keys.cards_in_play),
									await redis_client.hLen(game_redis_keys.players)
								)

								socket.broadcast
									.in('game.' + socket.user.current_game)
									.emit('czar-phase-start')
							} else {
								socket.broadcast
									.to('game.' + socket.user.current_game)
									.emit('player-selected')
							}
						}
					)
				}
			)
	}

	initialiseUser() {

	}
}