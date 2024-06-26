import shuffle from 'lodash.shuffle'
import GameAction from './GameAction.js'
import Game from '../models/Game.js'
import endGame from './traits/end-game.js'
import game_deck from '../config/decks/blackCards.js'
import user_deck from '../config/decks/whiteCards.js'

class CzarChosenAction extends GameAction {
	async handle(uuid) {
		if (
			typeof (uuid) !== 'string'
			|| !JSON.parse(await this.redis.hGet(this.getGameRedisKey('state'), 'is_started'))
			|| !JSON.parse(await this.redis.hGet(this.getGameRedisKey('state'), 'is_czar_phase'))
			|| !await this.redis.hExists(this.getGameRedisKey('cards_in_play'), uuid)
			|| uuid === await this.redis.hGet(this.getGameRedisKey('state'), 'current_czar')
			|| (await this.redis.hGet(this.getGameRedisKey('state'), 'current_czar')) !== this.socket.user.uuid
		) {
			return
		}

		const player_data = JSON.parse(await this.redis.hGet(this.getGameRedisKey('players'), uuid))

		if (!player_data) {
			return
		}

		await this.redis.del(this.getGameRedisKey('cards_in_play'))

		player_data.score++

		const game = await new Game().find(this.socket.user.current_game)

		if (player_data.score >= parseInt(await this.redis.hGet(this.getGameRedisKey('state'), 'max_score'))) {

			//TODO: MIXIN
			await endGame(game)

			this.io
				.in('game.' + this.socket.user.current_game)
				.emit('game-won', player_data)
		} else {
			!((await this.redis.lLen(this.getGameRedisKey('deck'))) - 1)
			&& (await this.redis.rPush(this.getGameRedisKey('deck'), shuffle(game_deck)))


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
				chosen_limit = ((await this.redis.lRange(this.getGameRedisKey('deck'), 0, 0))[0].match(/_/g) || [1]).length,
				user_sockets = (await this.io.in('game.' + this.socket.user.current_game).fetchSockets())
					.reduce((result, item:any) => {
						result[item.user.uuid] = item
						return result
					}, {})

			await this.redis.lTrim(this.getGameRedisKey('deck'), 1, -1)
			await this.redis.hSet(this.getGameRedisKey('players'), uuid, JSON.stringify(player_data))

			const new_card = (await this.redis.lRange(this.getGameRedisKey('deck'), 0, 0))[0],
				redis_players = await this.redis.hGetAll(this.getGameRedisKey('players')),
				parsed_players = Object.keys(redis_players)
					.map(uuid => {
						const data = JSON.parse(redis_players[uuid])

						uuid === new_czar_uuid
						&& (data.is_czar = true)

						//TODO: this will always set the old czar as self for everyone!!!!!
						uuid === this.socket.user.uuid
						&& (data.is_self = true)

						return data
					})


			for (const player_uuid of players) {
				const player_deck_redis_key = this.getPlayerRedisKey('deck', player_uuid),
					player_hand_redis_key = this.getPlayerRedisKey('hand', player_uuid)

				if (player_uuid !== this.socket.user.uuid) {
					chosen_limit >= (await this.redis.lLen(player_deck_redis_key))
					&& await this.redis.rPush(player_deck_redis_key, shuffle(user_deck))

					const drawn = await this.redis.lRange(player_deck_redis_key, 0, chosen_limit - 1)

					await this.redis.lTrim(
						player_deck_redis_key,
						chosen_limit,
						-1
					)

					await this.redis.rPush(player_hand_redis_key, drawn)
				}

				user_sockets[player_uuid].emit(
					'round-end',
					{
						card: new_card,
						is_czar: new_czar_uuid === player_uuid,
						winner: player_data,
						scoreboard: parsed_players,
						hand: await this.redis.lRange(player_hand_redis_key, 0, -1),
					}
				)
			}

			await this.redis.hSet(this.getGameRedisKey('state'), 'is_czar_phase', 'false')
			await this.redis.hSet(this.getGameRedisKey('state'), 'current_czar', new_czar_uuid)
		}
	}
}

export default CzarChosenAction