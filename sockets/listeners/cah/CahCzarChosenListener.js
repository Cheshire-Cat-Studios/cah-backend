const CahListener = require('./CahListener'),
	redis_client = require('../../../modules/redis'),
	JSON5 = require('json5'),
	endGame = require('../../../modules/game-logic/utility/end-game'),
	shuffle = require('lodash.shuffle'),
	game_deck = require('../../../config/decks/blackCards.json'),
	Game = require('../../../models/Game'),
	user_deck = require('../../../config/decks/whiteCards.json'),
	applyTraits = require('../../../helpers/applyTraits')

module.exports = class CahLeaveListener extends CahListener {

	constructor() {
		super()

		applyTraits(
			this,
			[
				require('./traits/end-game'),
				// require('./traits/end-round'),
			]
		)

	}

	async handle(uuid) {
		if (
			typeof (uuid) !== 'string'
			|| !JSON.parse(await redis_client.hGet(this.getGameRedisKey('state'), 'is_started'))
			|| !JSON.parse(await redis_client.hGet(this.getGameRedisKey('state'), 'is_czar_phase'))
			|| (await redis_client.hGet(this.getGameRedisKey('state'), 'current_czar')) !== this.socket.user.uuid
		) {
			return
		}

		const player_data = JSON5.parse(await redis_client.hGet(this.getGameRedisKey('players'), uuid))
		console.log(player_data)

		if (!player_data) {
			return
		}

		await redis_client.del(this.getGameRedisKey('cards_in_play'))

		player_data.score++

		console.log(await redis_client.hGet(this.getGameRedisKey('players'), uuid))

		if (player_data.score >= parseInt(await redis_client.hGet(this.getGameRedisKey('state'), 'max_score'))) {

			//TODO:: ffs
			this.endGame()

			this.io.to('game.' + this.socket.user.current_game)
				.emit('game-won', player_data)
		} else {
			!((await redis_client.lLen(this.getGameRedisKey('deck'))) - 1)
			&& (await redis_client.rPush(this.getGameRedisKey('deck'), shuffle(game_deck)))


			//TODO: change players relation to many to many, it will enforce ordering by join time asc, currently its user creation time asc ( or add an order field/query)
			const players = (
					await (
						await new Game()
							.find(this.socket.user.current_game)
					)
						.players()
						.handle()
						.select('uuid')
						.get()
				)
					.map(user => user.row.uuid),
				czar_index = players.indexOf(this.socket.user.uuid),
				new_czar_index = czar_index === players.length - 1 ? 0 : czar_index + 1,
				new_czar_uuid = players[new_czar_index],
				chosen_limit = ((await redis_client.lRange(this.getGameRedisKey('deck'), 0, 0))[0].match(/_/g) || [1]).length,
				user_sockets = (await this.io.in('game.' + this.socket.user.current_game).fetchSockets())
					.reduce((result, item) => {
						result[item.user.uuid] = item
						return result
					}, {})

			await redis_client.lTrim(this.getGameRedisKey('deck'), 1, -1)
			await redis_client.hSet(this.getGameRedisKey('players'), uuid, JSON5.stringify(player_data))

			const new_card = (await redis_client.lRange(this.getGameRedisKey('deck'), 0, 0))[0],
				redis_players = await redis_client.hGetAll(this.getGameRedisKey('players')),
				parsed_players = Object.keys(redis_players)
					.map(uuid => {
						const data = JSON5.parse(redis_players[uuid])

						uuid === new_czar_uuid
						&& (data.is_czar = true)

						uuid === this.socket.user.uuid
						&& (data.is_self = true)

						return data
					})


			for (const player_uuid of players) {
				const player_deck_redis_key = this.getPlayerRedisKey('deck', player_uuid),
					player_hand_redis_key = this.getPlayerRedisKey('hand', player_uuid)

				if (player_uuid !== this.socket.user.uuid) {
					chosen_limit >= (await redis_client.lLen(player_deck_redis_key))
					&& await redis_client.rPush(player_deck_redis_key, shuffle(user_deck))

					const drawn = await redis_client.lRange(player_deck_redis_key, 0, chosen_limit - 1)

					await redis_client.lTrim(
						player_deck_redis_key,
						chosen_limit,
						-1
					)

					await redis_client.rPush(player_hand_redis_key, drawn)
				}

				user_sockets[player_uuid].emit(
					'round-end',
					{
						card: new_card,
						is_czar: new_czar_uuid === player_uuid,
						winner: player_data,
						scoreboard: parsed_players,
						hand: await redis_client.lRange(player_hand_redis_key, 0, -1),
					}
				)
			}

			redis_client.hSet(this.getGameRedisKey('state'), 'is_czar_phase', 'false')
			redis_client.hSet(this.getGameRedisKey('state'), 'current_czar', new_czar_uuid)
		}
	}
}