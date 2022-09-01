const request = require('supertest'),
	app = require('jester').app(),
	redis_client = require('../../../../../modules/redis'),
	prepareDatabase = require('../../../../assets/prep/database'),
	prepareRedis = require('../../../../assets/prep/redis'),
	User = require('../../../../../models/User'),
	{verify} = require('jsonwebtoken')

describe('User -> create route', () => {
	const successful_name = '1234'

	let successful_response,
		created_user

	beforeAll(async done => {
		await prepareDatabase()
		await prepareRedis()

		done()
	})

	test('Request denied when no name is provided', async done => {
		const response = await request(app).post('/users')

		expect(response.statusCode)
			.toBe(400)

		expect(await (new User).get())
			.toBe(null)

		done()
	})

	test('Request denied when name is too short', async done => {
		const
			name = '1',
			response = await request(app)
				.post('/users')
				.send({name: '1'})

		expect(response.statusCode)
			.toBe(400)

		expect(await (new User).get())
			.toBe(null)

		done()
	})

	test('Request denied when name is too long', async done => {
		const
			name = '12345678901234567890123456789012345678901234567890123456789012345678901234567890',
			response = await request(app)
				.post('/users')
				.send({name})

		expect(response.statusCode)
			.toBe(400)

		expect(await (new User).get())
			.toBe(null)

		done()
	})

	test('Request successful when name is correct length', async done => {
		const response = await request(app)
			.post('/users')
			.send({name: successful_name})

		expect(response.statusCode)
			.toBe(200)

		successful_response = response

		done()
	})

	test('-- User is created', async () => {
		const user = await (new User())
			.orderBy('id')
			.first()

		expect(user.row.name)
			.toBe(successful_name)

		created_user = user
	})

	test('-- Response contains a valid jwt, which corresponds to the correct user', async () => {
		const uuid = verify(
			successful_response.body.data.token,
			process.env.JWT_ACCESS_TOKEN_SECRET
		)
			.uuid

		expect(uuid)
			.toBe(created_user.row.uuid)
	})

	afterAll(async done => {
		await redis_client.disconnect()

		done()
	})
})
