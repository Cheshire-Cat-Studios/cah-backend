const redis_client = require('../redis'),
	JSON5 = require('json5'),
	Game = require('../../models/Game'),
	User = require('../../models/User')

module.exports = async (io, socket, redis_keys) => {
	let czar_is_leaving = false

	if (
		socket.user.uuid === await redis_client.hGet(redis_keys.game.state, 'current_czar')
		// && JSON.parse(await redis_client.hGet(redis_keys.game.state, 'is_czar_phase'))
	) {
		czar_is_leaving = true

		await redis_client.hSet(redis_keys.game.state, 'current_czar', 'false')

		const game = await new Game().find(socket.user.current_game),
			players = game
				.players()
				.handle()
				.select('uuid')
				.get()
				.map(user => user.row.uuid),
			czar_index = players.indexOf(socket.user.uuid),
			new_czar_index = czar_index === players.length - 1 ? 0 : czar_index + 1,
			new_czar_uuid = players[new_czar_index],
			cards_in_play = await redis_client.hGetAll(redis_keys.game.cards_in_play)

		await redis_client.del(redis_keys.game.cards_in_play)

		Object.keys(cards_in_play)
			.forEach(uuid => {
				redis_client.rPush(`players.${uuid}.hand`, JSON.parse(cards_in_play[uuid]))
			})

		await redis_client.hSet(redis_keys.game.state, 'current_czar', new_czar_uuid)
		await redis_client.hSet(redis_keys.game.state, 'is_czar_phase', 'false')
	}

	new User()
		.find(socket.user.id)
		.update({
			'current_game': null,
		})

	//TODO: foreach for this and all other deletes
	await redis_client.del(redis_keys.player.hand)
	await redis_client.del(redis_keys.player.deck)
	await redis_client.del(redis_keys.player.is_active)

	await redis_client.hDel(redis_keys.game.cards_in_play, socket.user.uuid)
	await redis_client.hDel(redis_keys.game.players, socket.user.uuid)

	socket.leave('game.' + socket.user.current_game)

	const user_sockets = (await io.in('game.' + socket.user.current_game).fetchSockets())
			.reduce((result, item) => {
				result[item.user.uuid] = item
				return result
			}, {}),
		current_czar_uuid = await redis_client.hGet(redis_keys.game.state, 'current_czar'),
		is_czar_phase = JSON.parse(await redis_client.hGet(redis_keys.game.state, 'is_czar_phase')),
		cards_in_play = await redis_client.hGetAll(redis_keys.game.cards_in_play),
		player_list = await redis_client.hGetAll(redis_keys.game.players),
		scoreboard = Object.keys(player_list).map(uuid => JSON5.parse(player_list[uuid])),
		is_started = JSON.parse(await redis_client.hGet(redis_keys.game.state, 'is_started'))


	let cards_in_play_mapped = {}

	Object.keys(cards_in_play).forEach(uuid => {
		cards_in_play_mapped[uuid] = JSON.parse(cards_in_play[uuid])
	})

	if (is_started) {
		for (const uuid in user_sockets) {
			if (uuid === socket.user.uuid) {
				continue
			}

			let emit_data = {
				player_who_left: socket.user.name,
				left_player_was_czar: czar_is_leaving,
				is_czar: uuid === current_czar_uuid,
				is_czar_phase: is_czar_phase,
				hand: await redis_client.lRange(`players.${uuid}.hand`, 0, -1),
				scoreboard,
			}

			if (is_czar_phase) {
				emit_data.cards_in_play = cards_in_play_mapped
			} else {
				emit_data.own_cards_in_play = cards_in_play_mapped[uuid]

				emit_data.cards_in_play_count = Object.keys(cards_in_play_mapped).length

				emit_data.own_cards_in_play
				&& (emit_data.cards_in_play_count--)
			}

			// own_cards_in_play
			user_sockets[uuid].emit(
				'player-left',
				emit_data
			)
		}
	}

	const game = await new Game().find(socket.user.current_game)

	if (!game.players().handle().count()) {
		await redis_client.del(redis_keys.game.state)
		await redis_client.del(redis_keys.game.deck)
		await redis_client.del(redis_keys.game.players)
		await redis_client.del(redis_keys.game.cards_in_play)
	}

	if (game.row.host_id === socket.user.id) {
		const new_host_id = game.players()
			.handle()
			.orderBy('RANDOM()')
			.first()
			.row
			.id

		game.update({
			host_id: new_host_id
		})
	}


	socket.leave('game.' + socket.user.current_game)
}