import request from 'supertest'
import {app, RedisConnection} from '@cheshire-cat-studios/jester'
import prepareDatabase from '../../../../assets/prep/database.js'
import prepareRedis from '../../../../assets/prep/redis.js'
import User from '../../../../../models/User.js'
import Game from '../../../../../models/Game.js'
import {verify, sign} from 'jsonwebtoken'
import UserFactory from '../../../../../database/factories/UserFactory.js'
import {describe, expect, beforeAll, test, afterAll, vi} from 'vitest'

const initialisedApp = await app()

vi.mock(
	'../../../../../events/GameCreated',
	() => {
		class GameCreated {
			event_name = 'game-created'
			async = false

			handle(){
			}
		}

		return {default:GameCreated}
	}
)

describe('Game -> create route', () => {
	let
		successful_response,
		user,
		created_game,
		redis_client

	beforeAll(async () => {
		redis_client = await RedisConnection.getClient()

		await prepareDatabase()
		await prepareRedis()

		user = await (new UserFactory)
			.create()
	})

	test('Request is successful with valid data', async () => {
		const token = sign(
				{uuid: user.row.uuid},
				//TODO: use env service from jester
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
			response = await request(initialisedApp)
				.post('/games/')
				.set('Authorization', `Bearer ${token}`)
				.send(game_data)

		expect(response.statusCode)
			.toBe(200)

		const new_user = await (new User)
			.whereEquals('id', user.row.id)
			.first()

		expect(new_user.row.current_game)
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

	test('example test', () => {
		expect(true).toBe(true)
	})

	afterAll(async () => {
		await RedisConnection.disconnect()
		// await redis_client.disconnect()
	})
})
