const
	keys = require('../../../../../config/redis/keys'),
	getGameKey = require('../../../../../helpers/getRedisKey/game'),
	getUserKey = require('../../../../../helpers/getRedisKey/user'),
	// redis = require('../../../../../modules/redis'),
	shuffle = require('lodash.shuffle'),
	game_deck = require('../../../../../config/decks/blackCards.json'),
	randomiseArray = require('../../../../../helpers/randomiseArray'),
	drawToHand = require('./helpers/drawToHand'),
	redis_client = require('../../../../../modules/redis'),
	user_deck = require('../../../../../config/decks/whiteCards.json'),
	deleted_placeholder = '(*&^%$RFGHJU)afea',
	game_data = require('../../../../mocks/game-data')

let current_czar = null

module.exports = async (
	game,
	users,
	is_started = false,
	is_czar_phase = false,
	players_with_cards_in_play_count = 0
) => {
	const redis_client = require('../../../../../modules/redis')

	// await redis_client.rPush(getGameKey('deck', game.row.id), ["_ + _ = _."])
	await redis_client.rPush(getGameKey('deck', game.row.id), shuffle(game_deck))

	const cards_required_count = (
		(
			await redis_client.lRange(getGameKey('deck', game.row.id), 0, 0)
		)
			[0]
			.match(/_/g)
		|| [1]
	)
		.length


	if (is_started) {
		current_czar = randomiseArray(users).row.uuid

		let chosen_count = 0

		for (const user of users) {
			let has_chosen_cards = false

			game_data.pushUser(user.row.uuid)

			let cards = []

			//Create deck and draw to hand
			await redis_client.lPush(getUserKey('deck', user.row.uuid), shuffle(user_deck))
			await drawToHand(user, 10)

			//If its not the czar phase we can manually set the cards in play for each user to value given
			!is_czar_phase
			&& (
				game_data.player_data[user.row.uuid].cards_in_play_count =
					has_chosen_cards
						? players_with_cards_in_play_count - 1
						: players_with_cards_in_play_count
			)


			if (user.row.uuid === current_czar) {
				continue
			}


			if (chosen_count < players_with_cards_in_play_count) {
				has_chosen_cards = true
				//For every required card (one or more dependent on the black card)
				// get the card, push it to the chosen cards array,
				// set it to a value ready for bulk deletion (it's a redis thing)
				for (let i = 0; i < cards_required_count; i++) {
					//Get card value and push it to the cards array
					cards.push(
						await redis_client.lIndex(
							getUserKey('hand', user.row.uuid),
							`${i}`
						)
					)

					//Get card value and push it to the cards array
					await redis_client.lSet(
						getUserKey('hand', user.row.uuid),
						`${i}`,
						deleted_placeholder
					)
				}

				//TODO: choose cards from hand logic should be abstracted
				await redis_client.lRem(
					getUserKey('hand', user.row.uuid),
					cards_required_count,
					deleted_placeholder
				)

				await drawToHand(user, cards_required_count)

				//Set cards chosen to redis
				await redis_client.hSet(
					getGameKey('cards_in_play', game.row.id),
					user.row.uuid, JSON.stringify(cards)
				)
			}

			chosen_count++
		}

		//If its czar phase loop through all users again, after they've all chosen cards, and push the completed cards in play data
		if (is_czar_phase) {
			const cards_in_play = await redis_client.hGetAll(getGameKey('cards_in_play', game.row.id))

			for (const uuid in cards_in_play) {
				cards_in_play[uuid] = JSON.parse(cards_in_play[uuid])
			}

			for (const user of users) {
				game_data.player_data[user.row.uuid].cards_in_play = cards_in_play
			}
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
	])
}