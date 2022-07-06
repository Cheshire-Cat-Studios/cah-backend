const CahListener = require('./CahListener')
const Game = require('../../../models/Game')
const redis_client = require('../../../modules/redis')
const shuffle = require('lodash.shuffle')
const user_deck = require('../../../config/decks/whiteCards.json')
const JSON5 = require('json5')

module.exports = class CahInitialiseGameListener extends CahListener {
	async handle() {
		await redis_client.set(this.getPlayerRedisKey('is_active'), 'true')

		if (!await redis_client.hExists(this.getGameRedisKey('players'), this.socket.user.uuid)) {
			await redis_client.hSet(
				this.getGameRedisKey('players'),
				this.socket.user.uuid,
				`{score:0,name:'${this.socket.user.name}'}`
			)
			this.socket.broadcast
				.to('game.' + this.socket.user.current_game)
				.emit('player-joined', this.socket.user.name)
		}

		const host_id = (await new Game()
				.select('host_id')
				.whereEquals('id', this.socket.user.current_game)
				.first()
		)
			.row
			.host_id

		// !await redis_client.hGet(this.getGameRedisKey('state'), 'current_czar')
		// && await redis_client.hLen(this.getGameRedisKey('players')) === 1
		// && await redis_client.hSet(this.getGameRedisKey('state'), 'current_czar', this.socket.user.uuid)

		!await redis_client.exists(this.getPlayerRedisKey('deck'))
		&& await redis_client.lPush(this.getPlayerRedisKey('deck'), shuffle(user_deck))

		!await redis_client.exists(this.getPlayerRedisKey('hands'))
		&& await redis_client.lPush(
			this.getPlayerRedisKey('hands'),
			//LPOP node-redis method doesnt allow for length being specified
			await redis_client.sendCommand([
				'LPOP',
				this.getPlayerRedisKey('deck'),
				'10',
			]),
		)

		const current_czar = await redis_client.hGet(this.getGameRedisKey('state'), 'current_czar'),
			redis_players = await redis_client.hGetAll(this.getGameRedisKey('players')),
			parsed_players = Object.keys(redis_players)
				.map(uuid => {
					const data = JSON5.parse(redis_players[uuid])

					uuid === current_czar
					&& (data.is_czar = true)

					uuid === this.socket.user.uuid
					&& (data.is_self = true)

					return data
				})

		//TODO: move join to middleware?
		this.socket.join('game.' + this.socket.user.current_game)

		const is_czar_phase = JSON.parse(await redis_client.hGet(this.getGameRedisKey('state'), 'is_czar_phase')),
			game_data = {
				players: parsed_players,
				is_czar_phase: JSON.parse(await redis_client.hGet(this.getGameRedisKey('state'), 'is_czar_phase')),
				current_card: (await redis_client.lRange(this.getGameRedisKey('state'), 0, 0))[0],
				is_current_czar: this.socket.user.uuid === await redis_client.hGet(this.getGameRedisKey('state'), 'current_czar'),
				is_started: JSON.parse(await redis_client.hGet(this.getGameRedisKey('state'), 'is_started')),
				is_host: host_id === this.socket.user.id,
			}

		if (is_czar_phase) {
			let cards_in_play = await redis_client.hGetAll(this.getGameRedisKey('cards_in_play'))

			Object.keys(cards_in_play)
				.forEach(uuid => {
					cards_in_play[uuid] = JSON.parse(cards_in_play[uuid])
				})

			game_data.cards_in_play = cards_in_play
		} else {
			const player_cards_in_play = await redis_client.hGet(this.getGameRedisKey('cards_in_play'), this.socket.user.uuid),
				in_play_count = await redis_client.hLen(this.getGameRedisKey('cards_in_play'), this.socket.user.uuid)

			game_data.own_cards_in_play = JSON.parse(player_cards_in_play)
			game_data.cards_in_play_count = player_cards_in_play ? (in_play_count - 1) : in_play_count
		}

		//build user hand and deck
		this.socket.emit(
			'game-state',
			{
				game: game_data,
				hand: await redis_client.lRange(this.getPlayerRedisKey('hands'), 0, -1),
			}
		)
	}
}