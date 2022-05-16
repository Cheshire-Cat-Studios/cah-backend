//TODO: consider replacing all references to players game relation/query to be from the players redis store?

const redis_client = require('../redis'),
	JSON5 = require('json5'),
	Game = require('../../models/Game'),
	User = require('../../models/User'),
	randomiseArray = require('../../helpers/randomiseArray')

module.exports = async (io, socket, redis_keys) => {
	const game = await new Game()
			.find(socket.user.current_game),
		user = await new User()
			.find(socket.user.id)

	let new_czar;

	//If user or game doesn't exist or if the user has no game associated with it, exit
	if (
		!(
			user?.row?.current_game
			&& game
		)
		|| game?.row?.id !== user?.row?.current_game
	) {
		return
	}


	await user.update({
		current_game: null
	})

	const players = await game.players()
		.handle()
		.get()

	//Delete all player related redis data
	await redis_client.del(redis_keys.player.is_active)
	await redis_client.del(redis_keys.player.deck)
	await redis_client.del(redis_keys.player.hand)
	await redis_client.hDel(redis_keys.game.cards_in_play, user.row.uuid)


	//Remove leaving player from scoreboard
	await redis_client.hDel(redis_keys.game.players, user.row.uuid)

	//Leave game room and disconnect socket
	socket.leave('game.' + game.row.id)
	socket.disconnect()

	//If the game now has no players, delete it and exit
	if (
		!players?.length
	) {

		await redis_client.del(redis_keys.game.state)
		await redis_client.del(redis_keys.game.deck)
		await redis_client.del(redis_keys.game.players)
		await redis_client.del(redis_keys.game.cards_in_play)

		await game.delete()

		return
	}


	//If the game hasn't started there will be no game data to run logic against
	//TODO: empty game check before this!
	if (!JSON.parse(await redis_client.hGet(redis_keys.game.state, 'is_started'))) {
		return
	}

	const czar_is_leaving = (await redis_client.hGet(redis_keys.game.state, 'current_czar')) === user.row.uuid
		// is_czar_phase = JSON.parse(await redis_client.hGet(redis_keys.game.state, 'is_czar_phase'))

	if (czar_is_leaving) {
		//copy all cards in play to the players hands, then delete the cards in play
		const cards_in_play = await redis_client.hGetAll(redis_keys.game.cards_in_play)

		await redis_client.del(redis_keys.game.cards_in_play)

		//return all in play cards to hands
		for (const uuid in cards_in_play) {
			await redis_client.rPush(`players.${uuid}.hand`, JSON.parse(cards_in_play[uuid]))
		}

		//cycle czar
		new_czar = randomiseArray(players)

		await redis_client.hSet(redis_keys.game.state, 'is_czar_phase', JSON.stringify(false))
		await redis_client.hSet(redis_keys.game.state, 'current_czar', new_czar.row.uuid)
	}

	//If leaving user is the host change th	wertyui][pjhgfd,./a`e host to a random player
	if (game.row.host_id === user.row.id) {
		const new_host = randomiseArray(players)

		new_host
		&& game.update({
			host_id: new_host.row
				.id
		})
	}

	//Get all generic data that will be emited to all players and the actively connected players
	const
		redis_players = await redis_client.hGetAll(redis_keys.game.players),
		current_czar = czar_is_leaving
			? new_czar.row.uuid
			: await redis_client.hGet(redis_keys.game.state, 'current_czar'),
		scoreboard = Object.keys(redis_players)
			.map(uuid => {
				const data = JSON5.parse(redis_players[uuid])

				data.is_czar = uuid === current_czar

				uuid === socket.user.uuid
				&& (data.is_self = true)

				return data
			}),
		user_sockets = (
			await io.in('game.' + socket.user.current_game)
				.fetchSockets()
		)
			.reduce((result, item) => {
					result[item.user.uuid] = item
					return result
				},
				{}
			),
		generic_emit_data = {
			scoreboard,
			is_czar_phase: JSON.parse(await redis_client.hGet(redis_keys.game.state, 'is_czar_phase')),
			player_who_left_name: user.name,
			cards_in_play: await redis_client.hGetAll(redis_keys.game.cards_in_play),
		}

	for (const player of players) {
		user_sockets[player.row.uuid].emit(
			'player-left',
			{
				...generic_emit_data,
				hand: `players.${player.row.uuid}.hand`,
				is_czar: current_czar === player.row.uuid,
				is_host: player.row.is_host
			}
		)
	}

	//emit player-left
	//TODO: data needs; scoreboard, who left, new czar?
	// io.to('game.' + game.row.id)
	// 	.emit(
	// 		'player-left',
	// 		{
	// 			'name': user.row.name
	// 		}
	// 	)
}