const
	CahListener = require('./CahListener'),
	Game = require('../../../models/Game'),
	User = require('../../../models/User'),
	randomiseArray = require('../../../helpers/randomiseArray'),
	colour = require('../../../helpers/colour'),
	JSON5 = require('json5')

module.exports = class CahDisconnectListener extends CahListener {
	async handle() {
		const game = await new Game()
				.find(this.socket.user.current_game),
			user = await new User()
				.find(this.socket.user.id)

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

		//Delete all player related redis data
		this.redis.del(this.getPlayerRedisKey('is_active'))
		this.redis.del(this.getPlayerRedisKey('deck'))
		this.redis.del(this.getPlayerRedisKey('hand'))
		await this.redis.hDel(this.getGameRedisKey('cards_in_play'), user.row.uuid)

		//Remove leaving player from scoreboard
		this.redis.hDel(this.getGameRedisKey('players'), user.row.uuid)

		//Leave game room and disconnect socket
		this.socket.leave('game.' + game.row.id)
		this.socket.disconnect()

		const
			players = await game.players()
				.handle()
				.where('id', '<>', user.row.id)
				.get(),
			name_of_left = user.row.name

		//If the game now has no players, delete it and exit
		if (!players?.length) {
			this.redis.del(this.getGameRedisKey('state'))
			this.redis.del(this.getGameRedisKey('deck'))
			this.redis.del(this.getGameRedisKey('players'))
			this.redis.del(this.getGameRedisKey('cards_in_play'))

			game.delete()

			return
		}

		const players_in_play = await this.redis.hLen(this.getGameRedisKey('cards_in_play'))

		let is_czar_phase = JSON.parse(await this.redis.hGet(this.getGameRedisKey('state'), 'is_czar_phase')),
			new_czar


		//If the game hasn't started there will be no game data to run logic against
		//TODO: empty game check before this!
		if (!JSON.parse(await this.redis.hGet(this.getGameRedisKey('state'), 'is_started'))) {
			return
		}

		const czar_is_leaving = (await this.redis.hGet(this.getGameRedisKey('state'), 'current_czar')) === user.row.uuid

		if (czar_is_leaving) {
			new_czar = randomiseArray(players)

			//cycle czar
			await this.redis.hSet(this.getGameRedisKey('state'), 'current_czar', new_czar.row.uuid)

			// Return any cards the new czar had in play to their hand
			const new_czar_cards_in_play = await this.redis.hGet(this.getGameRedisKey('cards_in_play'), new_czar.row.uuid)
			await this.redis.hDel(this.getGameRedisKey('cards_in_play'), new_czar.row.uuid)

			// If the new czar has them in play return them to their hand
			new_czar_cards_in_play
			&& await this.redis.rPush(
				this.getPlayerRedisKey('hand', new_czar.row.uuid),
				JSON.parse(new_czar_cards_in_play)
			)
		}

		//If theres no one left in play set the czar phase to false
		if (
			is_czar_phase
			&& players_in_play <= 1
		) {
			colour.warning('SETTING CZSAR PHASE TO FALSE')
			await this.redis.hSet(this.getGameRedisKey('state'), 'is_czar_phase', JSON.stringify(false))

			is_czar_phase = false
		}

		//If it isnt the czar phase and everyone left has chosen, start it
		if (
			!is_czar_phase
			&& players_in_play
			&& (players.length - 1) === players_in_play
		) {
			await this.redis.hSet(this.getGameRedisKey('state'), 'is_czar_phase', JSON.stringify(true))

			console.log('HIT START CZAR PAHSE')
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
			redis_players = await this.redis.hGetAll(this.getGameRedisKey('players')),
			current_czar = czar_is_leaving
				? new_czar?.row?.uuid
				: await this.redis.hGet(this.getGameRedisKey('state'), 'current_czar'),
			// Get scoreboard data and reduce/map for FE consumption
			scoreboard = Object.keys(redis_players)
				.map(uuid => {
					const data = JSON5.parse(redis_players[uuid])

					data.is_czar = uuid === current_czar

					uuid === this.socket.user.uuid
					&& (data.is_self = true)

					return data
				}),
			// Get sockets of users in this game room, its done this way so we can access the user data stored against them
			user_sockets = (
				await this.io.in('game.' + this.socket.user.current_game)
					.fetchSockets()
			)
				.reduce((result, item) => {
						result[item.user.uuid] = item
						return result
					},
					{}
				),
			cards_in_play = await this.redis.hGetAll(this.getGameRedisKey('cards_in_play')),
			generic_emit_data = {
				scoreboard,
				is_czar_phase,
				player_who_left_name: user.name,
				cards_in_play,
			}

		//Loop through connected sockets and emit that the user has left and the new state of the game
		for (const player of players) {
			user_sockets[player.row.uuid]?.emit(
				'player-left',
				{
					...generic_emit_data,
					hand: await this.redis.lRange(this.getPlayerRedisKey('hand', player.row.uuid), 0, -1),
					is_czar: current_czar === player.row.uuid,
					is_host: player.row.is_host,
					name_of_left: name_of_left,
					new_czar_name: new_czar?.row?.name
				}
			)
		}
	}
}