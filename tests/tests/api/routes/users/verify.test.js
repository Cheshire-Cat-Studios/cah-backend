const request = require('supertest'),
	app = require('jester').app(),
	{RedisConnection} = require('jester'),
	prepareDatabase = require('../../../../assets/prep/database'),
	prepareRedis = require('../../../../assets/prep/redis'),
	User = require('../../../../../models/User'),
	{verify, sign} = require('jsonwebtoken')

describe('User -> verify route', () => {
	let
		token,
		user,
		successful_response,
		redis_client

	beforeAll(async done => {
		redis_client = await RedisConnection.getClient()

		await prepareDatabase()
		await prepareRedis()

		user = await (new User())
			.create({
				'uuid': 'testing-uuid',
				'name': '1234'
			})

		done()
	})

	test('Request successful when user includes auth headers', async () => {
		const token = sign(
			{uuid: user.row.uuid},
			process.env.JWT_ACCESS_TOKEN_SECRET,
		)

		const response = await request(app).get('/users/verify')
			.set('Authorization', `Bearer ${token}`)

		expect(response.statusCode)
			.toBe(200)

		successful_response = response
	})

	test('-- Token is valid and maps to the correct user', async () => {
		const uuid = verify(
			successful_response.body.data.token,
			process.env.JWT_ACCESS_TOKEN_SECRET
		)
			.uuid

		expect(uuid)
			.toBe(user.row.uuid)
	})


	afterAll(async done => {
		await redis_client.disconnect()

		done()
	})
})
