
	import {RedisConnection}from '@cheshire-cat-studios/jester'
	import prepareGame from '../../assets/prep/prepare-game'
	import fireListener from '../../mocks/fire-listener'
	import prepareDatabase from '../../assets/prep/database'
	import prepareRedis from '../../assets/prep/redis'
	import getGameKey from '../../../helpers/getRedisKey/game'
	import getUserKey from '../../../helpers/getRedisKey/user'
	import randomiseArray from '../../../helpers/randomiseArray'
	import GameData from '../../mocks/GameData'
 	import {game} from '../../../config/redis/keys'
	import {describe, expect, beforeAll, beforeEach, test, afterAll} from 'vitest'

let redis_client

//TODO: mocked client state tests
async function setUpGame(is_czar_phase = false, players_with_cards_in_play_count = 3, player_count = 5) {
	await prepareDatabase()
	await prepareRedis()

	GameData
		.reset()

		let mocked_user_sockets,
		game,
		users,
		current_czar,
		cards_in_play

	(
		{
			game,
			users,
			mocked_user_sockets
		} = await prepareGame(
			player_count,
			true,
			is_czar_phase,
			players_with_cards_in_play_count
		)
	)

	for (const user of users) {
		await fireListener(
			'initialise',
			mocked_user_sockets[user.row.uuid]
		)
	}

	current_czar = await redis_client.hGet(
		getGameKey('state', game.row.id), 'current_czar'
	)

	cards_in_play = await redis_client.hGetAll(
		getGameKey('cards_in_play', game.row.id)
	)

	return {
		mocked_user_sockets,
		game,
		users,
		current_czar,
		cards_in_play
	}
}

describe('Leave event listener', () => {
	beforeAll(async () => {
		redis_client = await RedisConnection.getClient()

	})

	test('If czar leaves czar_changes', async () => {
		const {
			mocked_user_sockets,
			game,
			current_czar
		} = await setUpGame()

		await fireListener(
			'leave',
			mocked_user_sockets[current_czar]
		)

		expect(
			await redis_client.hGet(
				getGameKey('state', game.row.id),
				'current_czar'
			)
		)
			.not
			.toBe(current_czar)
	})

	test('If czar leaves during czar phase and new czar had cards in play, those cards are returned to the new czar\'s hand',
		async () => {
			const {
				mocked_user_sockets,
				game,
				current_czar,
				cards_in_play
			}
				= await setUpGame(true, 3, 3)

			await fireListener(
				'leave',
				mocked_user_sockets[current_czar]
			)

			const new_czar = await redis_client.hGet(
				getGameKey('state', game.row.id),
				'current_czar'
			)

			expect(
				!!await redis_client.hGet(
					getGameKey('cards_in_play', game.row.id),
					new_czar
				)
			)
				.toBe(false)


			expect(
				await redis_client.hLen(
					getGameKey('cards_in_play', game.row.id)
				)
			)
				.toBe(
					Object.keys(cards_in_play).length - 1
				)
		})

	test('If last player who can choose cards leaves, czar phase starts', async () => {
		const {
			mocked_user_sockets,
			game,
			cards_in_play
		} = await setUpGame(true, 1, 3)

		await fireListener(
			'leave',
			mocked_user_sockets[Object.keys(cards_in_play)[0]]
		)


		expect(
			JSON.parse(
				await redis_client.hGet(
					getGameKey('state', game.row.id),
					'is_czar_phase'
				)
			)
		)
			.toBe(false)
	})

	test('Game is destroyed if last player leaves', async () => {
		const {
			mocked_user_sockets,
			game,
			users
		} = await setUpGame(false, 0, 1)

		await fireListener(
			'leave',
			mocked_user_sockets[users[0].row.uuid]
		)

		expect(
			await redis_client.hGetAll(
				getGameKey('state', game.row.id)
			)
		)
			.toMatchObject({})
	})

	test('If player leaves, their redis and mysql game relation data is destroyed', async () => {
		const
			{
				mocked_user_sockets,
				users
			} = await setUpGame(true, 3, 3),
			user = randomiseArray(users)

		await fireListener(
			'leave',
			mocked_user_sockets[user.row.uuid]
		)

		expect(
			!!await redis_client.exists(
				getUserKey('deck', user.row.uuid)
			)
		)
			.toBe(false)

		expect(
			!!await redis_client.exists(
				getUserKey('hand', user.row.uuid)
			)
		)
			.toBe(false)
	})

	test('If player leaves, the client_data scoreboards dont include the leaving player', async () => {
		const {
			mocked_user_sockets,
			users
		} = await setUpGame(true, 3, 3)

		await fireListener(
			'leave',
			mocked_user_sockets[users[0].row.uuid]
		)

		delete GameData.player_data[users[0].row.uuid]

		expect(
			Object.keys(GameData.player_data)
				.length
		)
			.toBe(users.length - 1)

		for (const uuid in GameData.player_data) {
			expect(
				GameData.player_data
					[uuid]
					.players
					.length
			)
				.toBe(users.length - 1)
		}
	})

	afterAll(async () => {
		await RedisConnection.disconnect()
		// await redis_client.disconnect()
	})
})