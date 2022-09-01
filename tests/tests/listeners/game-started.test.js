const
	{redis_client} = require('jester').modules,
	prepareGame = require('../../assets/prep/prepare-game'),
	game_data = require('../../mocks/game-data')
		.reset()
		.init(),
	getGameKey = require('../../../helpers/getRedisKey/game'),
	fireListener = require('../../mocks/fire-listener'),
	randomiseArray = require('../../../helpers/randomiseArray'),
	prepareDatabase = require('../../assets/prep/database'),
	prepareRedis = require('../../assets/prep/redis')

let mocked_user_sockets = {},
	host,
	game,
	users

describe('Game started event listener', () => {
	beforeAll(async done => {
		await prepareDatabase()
		await prepareRedis()

		done()
	})

	beforeEach(async done => {
		({game, users, mocked_user_sockets} = await prepareGame(3))

		for (const user of users) {
			await fireListener(
				'initialise',
				mocked_user_sockets[user.row.uuid]
			)
		}

		host = users.filter(user => user.row.id === game.row.host_id)[0].row

		done()
	})

	test('Every player has data', () => {
		expect(
			Object.keys(game_data.player_data)
				.length
		)
			.toBe(users.length)
	})

	test('Not host cannot start the game', async () => {
		const user = randomiseArray(
			users.filter(user => user.row.uuid !== host.uuid)
		)

		await fireListener(
			'start-game',
			mocked_user_sockets[user.row.uuid]
		)

		expect(
			!!JSON.parse(
				await redis_client.hGet(
					getGameKey('state', game.row.id),
					'is_started'
				)
			)
		)
			.toBe(false)
	})

	test('Host can start the game', async () => {
		await fireListener(
			'start-game',
			mocked_user_sockets[host.uuid]
		)

		expect(
			!!await redis_client.hGet(
				getGameKey('state', game.row.id),
				'is_started'
			)
		)
			.toBe(true)
	})

	test('-- Every player has correct is_czar data', async () => {
		await fireListener(
			'start-game',
			mocked_user_sockets[host.uuid]
		)

		const czar = await redis_client.hGet(
			getGameKey('state', game.row.id),
			'current_czar'
		)

		for (const uuid of Object.keys(game_data.player_data)) {
			expect(game_data.player_data[uuid].is_czar)
				.toBe(czar === uuid)
		}
	})

	afterAll(async done => {
		await redis_client.disconnect()

		done()
	})
})