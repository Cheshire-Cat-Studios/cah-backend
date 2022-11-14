import GameAction from './GameAction.js'

 class CardsChosenAction extends GameAction {
	async handle(data) {
		console.log('CARDS CHOSEN ACTION HIT')
		const card_count = (
				(await this.redis.lRange(this.getGameRedisKey('deck'), 0, 0))[0].match(/_/g)
				|| [1]
			)
				.length,
			deleted_placeholder = '(*&^%$RFGHJU)afea',//TODO: move into env value
			current_czar_uuid = await this.redis.hGet(this.getGameRedisKey('state'), 'current_czar')

		let cards = []

		/* TODO: create validation class for this, move this into an object for validation
		 * for more complex validation (2 variable comparison , x !== y etc), set the value as a closure containing the
		 * rule evaluation
		 */
		// if user is current czar, is currently the czar phase, already chosen cards, data isn't an array, data contains non ints, data isn't a unique set. return and ignore event
		if (
			!JSON.parse(await this.redis.hGet(this.getGameRedisKey('state'), 'is_started'))
			|| current_czar_uuid === this.socket.user.uuid
			|| JSON.parse(await this.redis.hGet(this.getGameRedisKey('state'), 'is_czar_phase'))
			|| await this.redis.hExists(this.getGameRedisKey('cards_in_play'), this.socket.user.uuid)
			|| !Array.isArray(data)
			|| data.filter(datum => typeof (datum) !== 'number').length
			|| new Set(data).size !== data.length
			|| data.length !== card_count
		) {


			// console.log(!JSON.parse(await this.redis.hGet(this.getGameRedisKey('state'), 'is_started')))
			// console.log(current_czar_uuid === this.socket.user.uuid)
			// console.log(JSON.parse(await this.redis.hGet(this.getGameRedisKey('state'), 'is_czar_phase')))
			// console.log(await this.redis.hExists(this.getGameRedisKey('cards_in_play'), this.socket.user.uuid))
			// console.log(!Array.isArray(data))
			// console.log(data.filter(datum => typeof (datum) !== 'number').length)
			// console.log(new Set(data).size !== data.length)
			console.log(data.length)
			console.log(data.length)
			console.log(card_count)

			console.log('CARDS CHOSEN VALIDATION FAILED ^ should all be false')
			return
		}

		for (const index of data) {
			cards.push(
				await this.redis.LINDEX(
					// @ts-ignore
					this.getPlayerRedisKey('hand'),
					`${index}`
				)
			)
		}

		if (cards.filter(card => !card).length) {
			return
		}

		for (const index of data) {
			await this.redis.lSet(
				// @ts-ignore
				this.getPlayerRedisKey('hand'),
				`${index}`,
				deleted_placeholder
			)
		}

		await this.redis.lRem(this.getPlayerRedisKey('hand'), card_count, deleted_placeholder)
		await this.redis.hSet(this.getGameRedisKey('cards_in_play'), this.socket.user.uuid, JSON.stringify(cards))

		//TODO: rethink below might have issues if people quit, maybe check if everyone else has selected when players quit, force czar phase if so -- THIS SHOULD BE FIXED WITH THE QUEUE --
		if (await this.redis.hLen(this.getGameRedisKey('cards_in_play')) === (await this.redis.hLen(this.getGameRedisKey('players'))) - 1) {
			await this.redis.hSet(this.getGameRedisKey('state'), 'is_czar_phase', JSON.stringify(true))

			let cards_in_play = await this.redis.hGetAll(this.getGameRedisKey('cards_in_play'))

			Object.keys(cards_in_play)
				.forEach(uuid => {
					cards_in_play[uuid] = JSON.parse(cards_in_play[uuid])
				})

			this.io.in('game.' + this.socket.user.current_game)
				.emit(
					'czar-phase-start',
					{
						cards_in_play: cards_in_play,
						czar_name: JSON.parse(
							await this.redis.hGet(
								this.getGameRedisKey('players'), current_czar_uuid)
						)
							.name
					}
				)
		} else {
			this.socket.broadcast
				.to('game.' + this.socket.user.current_game)
				.emit('player-selected')
		}
	}
}

export default CardsChosenAction