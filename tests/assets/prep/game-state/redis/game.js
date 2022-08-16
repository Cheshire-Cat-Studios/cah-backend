const
	keys = require('../../../../../config/redis/keys'),
	getGameKey = require('../../../../../helpers/getRedisKey/game'),
	// redis = require('../../../../../modules/redis'),
	shuffle = require('lodash.shuffle'),
	game_deck = require('../../../../../config/decks/blackCards.json')

module.exports = async (
	game,
	{
		is_started = false,
		is_czar_phase = false,
		current_czar = null,
		cards_in_play
	} = {
		current_czar: null,
	}
) => {
	const redis_client = require('../../../../../modules/redis')


	await redis_client.rPush(getGameKey('deck', game.row.id), shuffle(game_deck))

	if (cards_in_play) {
		for (const uuid in cards_in_play) {
			await redis_client.hSet(
				getGameKey('cards_in_play', game.row.id),
				uuid,
				JSON.stringify(cards_in_play[uuid])
			)
		}
	}

	await redis_client.sendCommand([
		'HMSET',
		`game.${game.row.id}.state`,
		'is_started',
		JSON.parse(!!is_started),
		'is_czar_phase',
		JSON.parse(!!is_czar_phase),
		'current_czar',
		`${current_czar}`,
		'max_score',
		`${game.row.max_score}`,
		'run_queue',
		'true'
	])

	await redis_client.lPush(`game.${game.row.id}.deck`, shuffle(game_deck))
}