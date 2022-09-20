import request from 'supertest'
import {app, RedisConnection} from '@cheshire-cat-studios/jester'
import prepareDatabase from '../../../../assets/prep/database'
import prepareRedis from '../../../../assets/prep/redis'
import User from '../../../../../models/User'
import {verify, sign} from 'jsonwebtoken'
import {describe, expect, beforeAll, test, afterAll, vi} from 'vitest'

const initialisedApp = await app()

describe('User -> verify route', () => {
	let
		token,
		user,
		successful_response,
		redis_client

	beforeAll(async () => {
		redis_client = await RedisConnection.getClient()

		await prepareDatabase()
		await prepareRedis()

		user = await (new User())
			.create({
				'uuid': 'testing-uuid',
				'name': '1234'
			})
	})

	test('Request successful when user includes auth headers', async () => {
		const token = sign(
			{uuid: user.row.uuid},
			process.env.JWT_ACCESS_TOKEN_SECRET,
		)

		const response = await request(initialisedApp).get('/users/verify')
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
			//@ts-ignore
			.uuid

		expect(uuid)
			.toBe(user.row.uuid)
	})


	afterAll(async () => {
		await redis_client.disconnect()
	})
})
