const redis_client = require('../redis'),
	user_deck = require('../../config/decks/whiteCards'),
	JSON5 = require('json5'),
	shuffle = require('lodash.shuffle'),
	Game = require('../../models/Game')

module.exports = async (io, socket, redis_keys) => {
	await redis_client.set(redis_keys.player.is_active, 'true')

	if (!await redis_client.hExists(redis_keys.game.players, socket.user.uuid)) {
		await redis_client.hSet(
			redis_keys.game.players,
			socket.user.uuid,
			`{score:0,name:'${socket.user.name}'}`
		)
		socket.broadcast
			.to('game.' + socket.user.current_game)
			.emit('player-joined', socket.user.name)
	}

	const host_id = new Game()
		.select('host_id')
		.whereEquals('id', socket.user.current_game)
		.first()
		.row
		.host_id

	// !await redis_client.hGet(redis_keys.game.state, 'current_czar')
	// && await redis_client.hLen(redis_keys.game.players) === 1
	// && await redis_client.hSet(redis_keys.game.state, 'current_czar', socket.user.uuid)

	!await redis_client.exists(redis_keys.player.deck)
	&& await redis_client.lPush(redis_keys.player.deck, shuffle(user_deck))

	!await redis_client.exists(redis_keys.player.hand)
	&& await redis_client.lPush(
		redis_keys.player.hand,
		//LPOP node-redis method doesnt allow for length being specified
		await redis_client.sendCommand([
			'LPOP',
			redis_keys.player.deck,
			'10',
		]),
	)

	const current_czar = await redis_client.hGet(redis_keys.game.state, 'current_czar'),
		redis_players = await redis_client.hGetAll(redis_keys.game.players),
		parsed_players = Object.keys(redis_players)
			.map(uuid => {
				const data = JSON5.parse(redis_players[uuid])

				uuid === current_czar
				&& (data.is_czar = true)

				uuid === socket.user.uuid
				&& (data.is_self = true)

				return data
			})

	//TODO: move join to middleware?
	socket.join('game.' + socket.user.current_game)

	const is_czar_phase = JSON.parse(await redis_client.hGet(redis_keys.game.state, 'is_czar_phase')),
		game_data = {
			players: parsed_players,
			is_czar_phase: JSON.parse(await redis_client.hGet(redis_keys.game.state, 'is_czar_phase')),
			current_card: (await redis_client.lRange(redis_keys.game.deck, 0, 0))[0],
			is_current_czar: socket.user.uuid === await redis_client.hGet(redis_keys.game.state, 'current_czar'),
			is_started: JSON.parse(await redis_client.hGet(redis_keys.game.state, 'is_started')),
			is_host: host_id === socket.user.id,
		}

	if (is_czar_phase) {
		let cards_in_play = await redis_client.hGetAll(redis_keys.game.cards_in_play)

		Object.keys(cards_in_play)
			.forEach(uuid => {
				cards_in_play[uuid] = JSON.parse(cards_in_play[uuid])
			})
		game_data.cards_in_play = cards_in_play
	} else {
		const player_cards_in_play = await redis_client.hGet(redis_keys.game.cards_in_play, socket.user.uuid),
			in_play_count = await redis_client.hLen(redis_keys.game.cards_in_play, socket.user.uuid)

		game_data.own_cards_in_play = JSON.parse(player_cards_in_play)
		game_data.cards_in_play_count = player_cards_in_play ? (in_play_count - 1) : in_play_count
	}

	//build user hand and deck
	socket.emit(
		'game-state',
		{
			game: game_data,
			hand: await redis_client.lRange(redis_keys.player.hand, 0, -1),
		}
	)
}