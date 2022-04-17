const redis_client = require('../redis'),
	JSON5 = require('json5')

module.exports = async (io, socket, redis_keys, data) => {
	const card_count = ((await redis_client.lRange(redis_keys.game.deck, 0, 0))[0].match(/_/g) || [1]).length,
		deleted_placeholder = '(*&^%$RFGHJU)afea',
		current_czar_uuid = await redis_client.hGet(redis_keys.game.state, 'current_czar')

	let cards = []

	// if user is current czar, is currently the czar phase, already chosen cards, data isn't an array, data contains non ints, data isn't a unique set. return and ignore event
	if (
		!JSON.parse(await redis_client.hGet(redis_keys.game.state, 'is_started'))
		|| current_czar_uuid === socket.user.uuid
		|| JSON.parse(await redis_client.hGet(redis_keys.game.state, 'is_czar_phase'))
		|| await redis_client.hExists(redis_keys.game.cards_in_play, socket.user.uuid)
		|| !Array.isArray(data)
		|| data.filter(datum => typeof (datum) !== 'number').length
		|| new Set(data).size !== data.length
		|| data.length !== card_count
	) {
		return
	}

	for (const index of data) {
		cards.push(await redis_client.lIndex(redis_keys.player.hand, `${index}`))
	}

	if (cards.filter(card => !card).length) {
		return
	}

	for (const index of data) {
		await redis_client.lSet(redis_keys.player.hand, `${index}`, deleted_placeholder)
	}

	await redis_client.lRem(redis_keys.player.hand, card_count, deleted_placeholder)
	await redis_client.hSet(redis_keys.game.cards_in_play, socket.user.uuid, JSON.stringify(cards))

	//TODO: rethink below might have issues if people quit, maybe check if everyone else has selected when players quit, force czar phase if so
	if (await redis_client.hLen(redis_keys.game.cards_in_play) === (await redis_client.hLen(redis_keys.game.players)) - 1) {
		await redis_client.hSet(redis_keys.game.state, 'is_czar_phase', JSON.stringify(true))

		let cards_in_play = await redis_client.hGetAll(redis_keys.game.cards_in_play)

		Object.keys(cards_in_play)
			.forEach(uuid => {
				cards_in_play[uuid] = JSON.parse(cards_in_play[uuid])
			})

		io.to('game.' + socket.user.current_game)
			.emit(
				'czar-phase-start',
				{
					cards_in_play: cards_in_play,
					czar_name: JSON5.parse(await redis_client.hGet(redis_keys.game.players, current_czar_uuid)).name
				}
			)
	} else {
		socket.broadcast
			.to('game.' + socket.user.current_game)
			.emit('player-selected')
	}
}