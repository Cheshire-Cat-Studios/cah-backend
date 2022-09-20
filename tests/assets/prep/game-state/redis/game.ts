import keys  from  '../../../../../config/redis/keys/index.js'
import getGameKey  from  '../../../../../helpers/getRedisKey/game.js'
import getUserKey  from  '../../../../../helpers/getRedisKey/user.js'
import shuffle from  'lodash.shuffle'
import game_deck  from  '../../../../../config/decks/blackCards.js'
import randomiseArray  from  '../../../../../helpers/randomiseArray.js'
import drawToHand  from  './helpers/drawToHand'
import user_deck  from  '../../../../../config/decks/whiteCards.js'
import GameData  from  '../../../../mocks/GameData'
import {RedisConnection}  from  '@cheshire-cat-studios/jester'

const deleted_placeholder = '(*&^%$RFGHJU)afea'


let current_czar = null

export default async (
	game,
	users,
	is_started = false,
	is_czar_phase = false,
	players_with_cards_in_play_count = 0
) => {
	const redis_client = await RedisConnection.getClient()

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

			GameData.pushUser(user.row.uuid)

			let cards = []

			//Create deck and draw to hand
			await redis_client.lPush(getUserKey('deck', user.row.uuid), shuffle(user_deck))
			await drawToHand(user, 10)

			//If its not the czar phase we can manually set the cards in play for each user to value given
			!is_czar_phase
			&& (
				GameData.player_data[user.row.uuid].cards_in_play_count =
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
							// @ts-ignore
							getUserKey('hand', user.row.uuid),
							`${i}`
						)
					)

					//Get card value and push it to the cards array
					await redis_client.lSet(
						// @ts-ignore
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
				GameData.player_data[user.row.uuid].cards_in_play = cards_in_play
			}
		}

	}

	await redis_client.sendCommand([
		'HMSET',
		`game.${game.row.id}.state`,
		'is_started',
		JSON.stringify(!!is_started),
		'is_czar_phase',
		JSON.stringify(!!is_czar_phase),
		'current_czar',
		`${current_czar}`,
		'max_score',
		`${game.row.max_score}`,
	])
}