//TODO: consider replacing all references to players game relation/query to be from the players redis store?
const redis_client = require('../redis'),
	JSON5 = require('json5'),
	Game = require('../../models/Game'),
	User = require('../../models/User'),
	randomiseArray = require('../../helpers/randomiseArray'),
	colour = require('../../helpers/colour')

module.exports = async (io, socket, redis_keys) => {
	const game = await new Game()
			.find(socket.user.current_game),
		user = await new User()
			.find(socket.user.id)



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


	user.update({
		current_game: null
	})

	const players = await game.players()
		.handle()
		.where('id', '<>', user.row.id)
		.get(),
		name_of_left = user.row.name,
		players_in_play = await redis_client.hLen(redis_keys.game.cards_in_play)

	let is_czar_phase = JSON.parse(await redis_client.hGet(redis_keys.game.state, 'is_czar_phase')),
		new_czar

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

	if (czar_is_leaving) {
		new_czar = randomiseArray(players)

		//cycle czar
		await redis_client.hSet(redis_keys.game.state, 'current_czar', new_czar.row.uuid)

		// Return any cards the new czar had in play to their hand
		const new_czar_cards_in_play = await redis_client.hGet(redis_keys.game.cards_in_play, new_czar.row.uuid)
		await redis_client.hDel(redis_keys.game.cards_in_play, new_czar.row.uuid)

		// If the new czar has them in play return them to their hand
		new_czar_cards_in_play
		&& await redis_client.rPush(
			`players.${new_czar.row.uuid}.hand`,
			JSON.parse(new_czar_cards_in_play)
		)
	}

	//TODO: duplicate logic, abstract out
	// console.log(
	// 	!is_czar_phase,
	// 	players.length,
	// 	players_in_play
	// )

	//If theres no one left in play set the czar phase to false
	if(
		is_czar_phase
		&& players_in_play === 1
	){
		colour.warning('SETTING CZSAR PHASE TO FALSE')
		await redis_client.hSet(redis_keys.game.state, 'is_czar_phase', JSON.stringify(false))

		is_czar_phase = false
	}

	//If it isnt the czar phase and everyone left has chosen, start it
	if(
		!is_czar_phase
		&& (players.length - 1) === players_in_play
	){
		colour.success('SETTING CZSAR PHASE TO TRUE')
		console.log(is_czar_phase)

		await redis_client.hSet(redis_keys.game.state, 'is_czar_phase', JSON.stringify(true))

		is_czar_phase = true
	}


	//If leaving user is the host change the host to a random player
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
			? new_czar?.row?.uuid
			: await redis_client.hGet(redis_keys.game.state, 'current_czar'),
		// Get scoreboard data and reduce/map for FE consumption
		scoreboard = Object.keys(redis_players)
			.map(uuid => {
				const data = JSON5.parse(redis_players[uuid])

				data.is_czar = uuid === current_czar

				uuid === socket.user.uuid
				&& (data.is_self = true)

				return data
			}),
		// Get sockets of users in this game room, its done this way so we can access the user data stored against them
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
		cards_in_play = await redis_client.hGetAll(redis_keys.game.cards_in_play),
		generic_emit_data = {
			scoreboard,
			is_czar_phase,
			player_who_left_name: user.name,
			cards_in_play,
		}

	//Loop through connected sockets and emit that the user has left and the new state of the game
	for (const player of players) {
		user_sockets[player.row.uuid].emit(
			'player-left',
			{
				...generic_emit_data,
				hand: await redis_client.lRange(`players.${player.row.uuid}.hand`, 0, -1),
				is_czar: current_czar === player.row.uuid,
				is_host: player.row.is_host,
				name_of_left: name_of_left,
				new_czar_name: new_czar?.row?.name
			}
		)
	}
}