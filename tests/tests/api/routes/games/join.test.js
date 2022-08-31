const request = require('supertest'),
	app = require('../../../../../app'),
	redis_client = require('../../../../../modules/redis'),
	prepareDatabase = require('../../../../assets/prep/database'),
	prepareRedis = require('../../../../assets/prep/redis'),
	User = require('../../../../../models/User'),
	Game = require('../../../../../models/Game'),
	{sign} = require('jsonwebtoken'),
	GameFactory = require('../../../../../database/factories/GameFactory'),
	UserFactory = require('../../../../../database/factories/UserFactory')

async function createGame(is_full = false, password = '') {
	const game = await (new GameFactory)
		.setRow({
			host_id: 1,
			max_players: 1,
			password,
		})
		.create()

	if (is_full) {
		await (new UserFactory)
			.setRow({
				current_game: game.row.id
			})
			.create()
	}

	const user = await (new UserFactory).create(),
		token = sign(
			{uuid: user.row.uuid},
			process.env.JWT_ACCESS_TOKEN_SECRET,
		)

	return {user, token, game}
}

describe('Game -> join route', () => {
	beforeAll(async done => {
		await prepareDatabase()
		await prepareRedis()

		done()
	})

	beforeEach(async done => {
		await (new Game).delete()
		await (new User).delete()

		done()
	})

	test('User cannot join game if the game is full', async () => {
		const {user, token, game} = await createGame(true)

		const response = await request(app)
			.post('/games/join/' + game.row.uuid)
			.set('Authorization', `Bearer ${token}`)

		expect(response.statusCode)
			.toBe(400)
	})

	test('User can join game if the game is not full', async () => {
		const {user, token, game} = await createGame(),
			response = await request(app)
				.post('/games/join/' + game.row.uuid)
				.set('Authorization', `Bearer ${token}`)

		expect(response.statusCode)
			.toBe(200)

		expect(
			(
				await (new User)
					.whereEquals('id', user.row.id)
					.select('current_game')
					.first()
			)
				.row
				.current_game
		)
			.toBe(game.row.id)
	})

	test('User cannot join game if password is required and an correct one is given, but the game is full',
		async () => {
			const
				password = 'password',
				{user, token, game} = await createGame(true, password),
				response = await request(app)
					.post('/games/join/' + game.row.uuid)
					.set('Authorization', `Bearer ${token}`)
					.send({password})

			expect(
				(
					await (new User)
						.whereEquals('id', user.row.id)
						.first()
				)
					.row
					.current_game
			)
				.toBe(null)


			expect(response.statusCode)
				.toBe(400)
		}
	)

	test('User can join game if password is required and an correct one is given and the game is not full',
		async () => {
			const
				password = 'password',
				{user, token, game} = await createGame(false, password),
				response = await request(app)
					.post('/games/join/' + game.row.uuid)
					.set('Authorization', `Bearer ${token}`)
					.send({password})

			expect(response.statusCode)
				.toBe(200)

			expect(
				(
					await (new User)
						.whereEquals('id', user.row.id)
						.select('current_game')
						.first()
				)
					.row
					.current_game
			)
				.toBe(game.row.id)


			expect(true).toBe(true)
		}
	)

	afterAll(async done => {
		await redis_client.disconnect()

		done()
	})
})
