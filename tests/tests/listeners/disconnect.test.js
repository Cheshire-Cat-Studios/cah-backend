const
	{
		providers: {
			EventServiceProvider
		},
		modules: {
			redis_client
		}
	} = require('jester'),
	prepareGame = require('../../assets/prep/prepare-game'),
	CahInitialiseGameListener = require('../../../sockets/listeners/cah/CahInitialiseGameListener'),
	CahDisconnectListener = require('../../../sockets/listeners/cah/CahDisconnectListener'),
	prepareDatabase = require('../../assets/prep/database'),
	prepareRedis = require('../../assets/prep/redis'),
	game_data = require('../../mocks/game-data').init().reset()

let users,
	mocked_user_sockets,
	event_queued = false

jest.mock(
	'../../../events/UserLeft',
	() => {
		return class UserLeft {
			event_name = 'user-left'
			async = false

			handle() {
				event_queued = true
			}
		}

	}
)

describe('Disconnect event listener', () => {
	beforeAll(async done => {
		await prepareDatabase()
		await prepareRedis();

		(new EventServiceProvider)
			.handle();

		({users, mocked_user_sockets} = await prepareGame(3))

		for (const user of users) {
			await (new CahInitialiseGameListener)
				.setSocket(mocked_user_sockets[user.row.uuid])
				.setIo(mocked_user_sockets[user.row.uuid])
				.handle()
		}

		done()
	})

	test('If user disconnects a user-left event is fired', async () => {
		const user = users[0]

		await (new CahDisconnectListener)
			.setSocket(mocked_user_sockets[user.row.uuid])
			.setIo(mocked_user_sockets[user.row.uuid])
			.handle()


		expect(
			event_queued
		)
			.toBe(true)
	})

	afterAll(async done => {
		await redis_client.disconnect()

		done()
	})
})