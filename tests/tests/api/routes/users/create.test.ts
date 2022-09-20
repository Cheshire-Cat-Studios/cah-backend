import request from 'supertest'
import {app, RedisConnection} from '@cheshire-cat-studios/jester'
import prepareDatabase from '../../../../assets/prep/database'
import prepareRedis from '../../../../assets/prep/redis'
import User from '../../../../../models/User'
import {verify} from 'jsonwebtoken'
import {describe, expect, beforeAll, test, afterAll, vi} from 'vitest'

const initialisedApp = await app()

describe('User -> create route', () => {
	const successful_name = '1234'

	let successful_response,
		created_user,
		redis_client

	beforeAll(async () => {
		redis_client = await RedisConnection.getClient()

		await prepareDatabase()
		await prepareRedis()
	})

	test('Request denied when no name is provided', async () => {
		const response = await request(initialisedApp).post('/users')

		expect(response.statusCode)
			.toBe(400)

		expect(await (new User).get())
			.toBe(null)
	})

	test('Request denied when name is too short', async () => {
		const
			name = '1',
			response = await request(initialisedApp)
				.post('/users')
				.send({name: '1'})

		expect(response.statusCode)
			.toBe(400)

		expect(await (new User).get())
			.toBe(null)
	})

	test('Request denied when name is too long', async () => {
		const
			name = '12345678901234567890123456789012345678901234567890123456789012345678901234567890',
			response = await request(initialisedApp)
				.post('/users')
				.send({name})

		expect(response.statusCode)
			.toBe(400)

		expect(await (new User).get())
			.toBe(null)
	})

	test('Request successful when name is correct length', async () => {
		const response = await request(initialisedApp)
			.post('/users')
			.send({name: successful_name})

		expect(response.statusCode)
			.toBe(200)

		successful_response = response
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
			// @ts-ignore
			.uuid

		expect(uuid)
			.toBe(created_user.row.uuid)
	})

	afterAll(async () => {
		await redis_client.disconnect()
	})
})
