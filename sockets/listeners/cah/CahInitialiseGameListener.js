const
	CahListener = require('./CahListener'),
	Game = require('../../../models/Game'),
	shuffle = require('lodash.shuffle'),
	user_deck = require('../../../config/decks/whiteCards.json')

module.exports = class CahInitialiseGameListener extends CahListener {
	async handle() {
		await this.redis.set(this.getPlayerRedisKey('is_active'), 'true')

		if (!await this.redis.hExists(this.getGameRedisKey('players'), this.socket.user.uuid)) {
			await this.redis.hSet(
				this.getGameRedisKey('players'),
				this.socket.user.uuid,
				JSON.stringify({
					score:0,
					name: this.socket.user.name
				})
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

		!await this.redis.exists(this.getPlayerRedisKey('deck'))
		&& await this.redis.lPush(this.getPlayerRedisKey('deck'), shuffle(user_deck))

		!await this.redis.exists(this.getPlayerRedisKey('hand'))
		&& await this.redis.lPush(
			this.getPlayerRedisKey('hand'),
			//LPOP node-redis method doesnt allow for length being specified
			await this.redis.sendCommand([
				'LPOP',
				this.getPlayerRedisKey('deck'),
				'10',
			]),
		)

		const current_czar = await this.redis.hGet(this.getGameRedisKey('state'), 'current_czar'),
			redis_players = await this.redis.hGetAll(this.getGameRedisKey('players')),
			parsed_players = Object.keys(redis_players)
				.map(uuid => {
					const data = JSON.parse(redis_players[uuid])

					uuid === current_czar
					&& (data.is_czar = true)

					uuid === this.socket.user.uuid
					&& (data.is_self = true)

					return data
				})

		//TODO: move join to middleware?
		this.socket.join('game.' + this.socket.user.current_game)

		const is_czar_phase = JSON.parse(await this.redis.hGet(this.getGameRedisKey('state'), 'is_czar_phase')),
			game_data = {
				players: parsed_players,
				is_czar_phase: JSON.parse(await this.redis.hGet(this.getGameRedisKey('state'), 'is_czar_phase')),
				current_card: (await this.redis.lRange(this.getGameRedisKey('deck'), 0, 0))[0],
				is_current_czar: this.socket.user.uuid === await this.redis.hGet(this.getGameRedisKey('state'), 'current_czar'),
				is_started: JSON.parse(await this.redis.hGet(this.getGameRedisKey('state'), 'is_started')),
				is_host: host_id === this.socket.user.id,
			}

		if (is_czar_phase) {
			let cards_in_play = await this.redis.hGetAll(this.getGameRedisKey('cards_in_play'))

			Object.keys(cards_in_play)
				.forEach(uuid => {
					cards_in_play[uuid] = JSON.parse(cards_in_play[uuid])
				})

			game_data.cards_in_play = cards_in_play
		} else {
			const player_cards_in_play = await this.redis.hGet(this.getGameRedisKey('cards_in_play'), this.socket.user.uuid),
				in_play_count = await this.redis.hLen(this.getGameRedisKey('cards_in_play'), this.socket.user.uuid)

			game_data.own_cards_in_play = JSON.parse(player_cards_in_play)
			game_data.cards_in_play_count = player_cards_in_play ? (in_play_count - 1) : in_play_count
		}

		//build user hand and deck
		this.socket.emit(
			'game-state',
			{
				game: game_data,
				hand: await this.redis.lRange(this.getPlayerRedisKey('hand'), 0, -1),
			}
		)
	}
}