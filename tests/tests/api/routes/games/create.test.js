const request = require('supertest'),
	app = require('jester').app(),
	{redis_client} = require('jester').modules,
	prepareDatabase = require('../../../../assets/prep/database'),
	prepareRedis = require('../../../../assets/prep/redis'),
	User = require('../../../../../models/User'),
	Game = require('../../../../../models/Game'),
	{verify, sign} = require('jsonwebtoken'),
	UserFactory = require('../../../../../database/factories/UserFactory')

jest.mock(
	'../../../../../events/GameCreated',
	() => {
		return class GameCreated {
			event_name = 'game-created'
			async = false

			handle(){
			}
		}

	}
);


describe('Game -> create route', () => {
	let successful_response,
		user,
		created_game

	beforeAll(async done => {
		await prepareDatabase()
		await prepareRedis()

		user = await (new UserFactory)
			.create()

		done()
	})

	test('Example test', () => {
		expect(true)
			.toBe(true)
	})

	test('Request is successful with valid data', async () => {
		const token = sign(
				{uuid: user.row.uuid},
				process.env.JWT_ACCESS_TOKEN_SECRET,
			),
			game_data = {
				name: 'testing name',
				password: '',
				max_score: 10,
				max_players: 5,
				round_time_limit_mins: 10,
				game_time_limit_mins: 10,

			},
			response = await request(app)
				.post('/games/')
				.set('Authorization', `Bearer ${token}`)
				.send(game_data)


		expect(response.statusCode)
			.toBe(200)

		const new_user = await (new User)
			.whereEquals('id', user.row.id)
			.first()

		expect(new_user.current_game)
			.not
			.toBe(null)

		const game = await (new Game)
			.whereEquals('id', new_user.row.current_game)
			.first()

		expect(!!game)
			.toBe(true)

		for (const key in game_data) {
			expect(game.row[key])
				.toBe(game_data[key])
		}

	})

	afterAll(async done => {
		await redis_client.disconnect()

		done()
	})
})
