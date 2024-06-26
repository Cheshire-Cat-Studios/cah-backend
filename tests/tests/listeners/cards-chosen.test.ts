import {RedisConnection} from '@cheshire-cat-studios/jester'
import prepareGame from '../../assets/prep/prepare-game'
import createSocketMock from '../../mocks/socket'
import GameData from '../../mocks/GameData'
import fireListener from '../../mocks/fire-listener'
import prepareDatabase from '../../assets/prep/database'
import prepareRedis from '../../assets/prep/redis'
import getGameKey from '../../../helpers/getRedisKey/game'
import getUserKey from '../../../helpers/getRedisKey/user'
import randomiseArray from '../../../helpers/randomiseArray'
import {describe, expect, beforeAll, test, afterAll} from 'vitest'

GameData.reset()

let mocked_user_sockets = {},
	host,
	game,
	users,
	chosen_count,
	redis_client,
	cards = []

describe('Cards chosen event listener', () => {
	beforeAll(async () => {
		redis_client = await RedisConnection.getClient()

		await prepareDatabase()
		await prepareRedis();

		(
			{
				game,
				users,
				mocked_user_sockets
			} = await prepareGame(
				5,
				true,
				false,
				2
			)
		)

		chosen_count = (
			(
				await redis_client.lRange(getGameKey('deck', game.row.id), 0, 0)
			)
				[0]
				.match(/_/g)
			|| [1]
		)
			.length

		for (let i = 0; i < chosen_count; i++) {
			cards[i] = i
		}

		for (const user of users) {
			await fireListener(
				'initialise',
				mocked_user_sockets[user.row.uuid]
			)
		}
	})

	test('Player who has already chosen cannot choose again', async () => {
		const uuid = randomiseArray(
				await redis_client.HKEYS(
					getGameKey('cards_in_play', game.row.id)
				)
			),
			old_chosen_cards = await redis_client.HGET(
				getGameKey('cards_in_play', game.row.id),
				uuid
			),
			player_socket = mocked_user_sockets[uuid]

		await fireListener(
			'cards-chosen',
			mocked_user_sockets[uuid],
			[2, 3]
		)

		expect(
			await redis_client.HGET(
				getGameKey('cards_in_play', game.row.id),
				uuid,
			)
		)
			.toBe(old_chosen_cards)
	})

	test('Czar cannot choose a card', async () => {
		let cards = []

		const uuid = await redis_client.HGET(
			getGameKey('state', game.row.id),
			'current_czar'
		)

		await fireListener(
			'cards-chosen',
			mocked_user_sockets[uuid],
			cards
		)

		expect(
			await redis_client.HGET(
				getGameKey('cards_in_play', game.row.id),
				uuid
			)
		)
			.toBe(null)
	})

	test('Player cannot choose too many cards', async () => {
		const chosen_uuids = await redis_client.HKEYS(
				getGameKey('cards_in_play', game.row.id)
			),
			uuid = randomiseArray(
				users.filter(
					user => !chosen_uuids.includes(user.row.uuid)
				)
			)
				.row
				.uuid

		await fireListener(
			'cards-chosen',
			mocked_user_sockets[uuid],
			[0, 1, 2, 3, 4, 5]
		)

		expect(
			await redis_client.HGET(
				getGameKey('cards_in_play', game.row.id),
				uuid
			)
		)
			.toBe(null)
	})

	test('Player cannot choose no cards', async () => {
		const chosen_uuids = await redis_client.HKEYS(
				getGameKey('cards_in_play', game.row.id)
			),
			uuid = randomiseArray(
				users.filter(
					user => !chosen_uuids.includes(user.row.uuid)
				)
			)
				.row
				.uuid

		await fireListener(
			'cards-chosen',
			mocked_user_sockets[uuid],
			[]
		)

		expect(
			await redis_client.HGET(
				getGameKey('cards_in_play', game.row.id),
				uuid
			)
		)
			.toBe(null)
	})

	test('Player cannot choose cards that are not in their hand', async () => {
		const chosen_uuids = await redis_client.HKEYS(
				getGameKey('cards_in_play', game.row.id)
			),
			uuid = randomiseArray(
				users.filter(
					user => !chosen_uuids.includes(user.row.uuid)
				)
			)
				.row
				.uuid

		await fireListener(
			'cards-chosen',
			mocked_user_sockets[uuid],
			cards.map(card => card += 100)
		)

		expect(
			await redis_client.HGET(
				getGameKey('cards_in_play', game.row.id),
				uuid
			)
		)
			.toBe(null)


	})

	test('Player can choose cards if those cards are in their hand and the amount is correct', async () => {
		const chosen_uuids = await redis_client.HKEYS(
				getGameKey('cards_in_play', game.row.id)
			),
			current_czar = await redis_client.hGet(getGameKey('state', game.row.id), 'current_czar'),
			user = randomiseArray(
				users.filter(
					user => user.row.uuid !== current_czar
						&& !chosen_uuids.includes(user.row.uuid)
				)
			)
				.row

		let expected_cards = []

		for (const card of cards) {
			expected_cards.push(
				await redis_client.lIndex(
					getUserKey('hand', user.uuid),
					card
				)
			)
		}

		await fireListener(
			'cards-chosen',
			mocked_user_sockets[user.uuid],
			cards
		)

		expect(
			JSON.parse(
				await redis_client.HGET(
					getGameKey('cards_in_play', game.row.id),
					user.uuid
				)
			)
		)
			.toStrictEqual(expected_cards)
	})

	test('-- All players have the correct cards in play count', async () => {
		const chosen_cards = await redis_client.hGetAll(getGameKey('cards_in_play', game.row.id))

		for (const uuid in GameData.player_data) {
			const has_chosen = Object.keys(chosen_cards).includes(uuid)

			//Player cards_in_play_count data DOES NOT include their own card
			//the property is used to track other players who've chosen cards before the round end as they show as blank cards in the fe
			expect(GameData.player_data[uuid].cards_in_play_count)
				.toBe(
					has_chosen
						? Object.keys(chosen_cards).length - 1
						: Object.keys(chosen_cards).length
				)
		}
	})

	test('Czar phase starts if all players have chosen cards', async () => {
		const chosen_uuids = await redis_client.HKEYS(
				getGameKey('cards_in_play', game.row.id)
			),
			current_czar = await redis_client.hGet(getGameKey('state', game.row.id), 'current_czar'),
			uuid = randomiseArray(
				users.filter(
					user => user.row.uuid !== current_czar
						&& !chosen_uuids.includes(user.row.uuid)
				)
			)
				.row
				.uuid

		await fireListener(
			'cards-chosen',
			mocked_user_sockets[uuid],
			cards
		)

		expect(
			JSON.parse(
				await redis_client.HGET(
					getGameKey('state', game.row.id),
					'is_czar_phase'
				)
			)
		)
			.toBe(true)
	})

	test('-- All players cards in play data match redis', async () => {
		const chosen_cards = await redis_client.hGetAll(getGameKey('cards_in_play', game.row.id))

		for (const uuid in GameData.player_data) {
			const player_data = GameData.player_data[uuid]

			expect(
				Object.keys(player_data.cards_in_play)
					.length
			)
				.toBe(
					Object.keys(chosen_cards)
						.length
				)

			for (const cards_uuid in player_data.cards_in_play) {
				expect(
					player_data.cards_in_play[cards_uuid]
				)
					.toStrictEqual(
						JSON.parse(
							chosen_cards[cards_uuid]
						)
					)
			}
		}
	})

	afterAll(async () => {
		await redis_client.disconnect()
	})
})