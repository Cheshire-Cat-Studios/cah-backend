import request from 'supertest'
import {app, RedisConnection} from '@cheshire-cat-studios/jester'
import prepareDatabase from '../../../../assets/prep/database.js'
import prepareRedis from '../../../../assets/prep/redis.js'
import User from '../../../../../models/User.js'
import Game from '../../../../../models/Game.js'
import {verify, sign} from 'jsonwebtoken'
import GameFactory from '../../../../../database/factories/GameFactory.js'
import {describe, expect, beforeAll, test, afterAll, vi} from 'vitest'

const initialisedApp = await app()

describe('Game -> get route', () => {
	let successful_response,
		user,
		games,
		redis_client

	beforeAll(async () => {
		redis_client = await RedisConnection.getClient()
		await prepareDatabase()
		await prepareRedis()

		user = await (new User)
			.create({
				'uuid': 'testing-uuid',
				'name': '1234'
			})

		await (new GameFactory)
			.setCount(5)
			.store()

		games = await (new Game).get()
	})

	test('Request successful when user includes auth headers', async () => {
		const token = sign(
			{uuid: user.row.uuid},
			process.env.JWT_ACCESS_TOKEN_SECRET,
		)

		const response = await request(initialisedApp).get('/games')
			.set('Authorization', `Bearer ${token}`)

		expect(response.statusCode)
			.toBe(200)

		successful_response = response
	})

	test('-- Response game data matches database', () => {
		expect(
			successful_response.body
				.data
				.games
				.length
		)
			.toBe(games.length)

		const mapped_database_games = {},
			mapped_response_games = {}

		games.forEach(game => mapped_database_games[game.row.uuid] = game.row)

		successful_response.body
			.data
			.games
			.forEach(
				game => mapped_response_games[game.uuid] = game
			)

		for (const uuid in mapped_response_games) {
			expect(!!mapped_database_games[uuid])
				.toBe(true)

			expect(mapped_response_games[uuid].name)
				.toBe(mapped_database_games[uuid].name)

			expect(mapped_response_games[uuid].game_time_limit_mins)
				.toBe(mapped_database_games[uuid].game_time_limit_mins)

			expect(mapped_response_games[uuid].round_time_limit_mins)
				.toBe(mapped_database_games[uuid].round_time_limit_mins)

			expect(mapped_response_games[uuid].max_players)
				.toBe(mapped_database_games[uuid].max_players)

			expect(mapped_response_games[uuid].max_score)
				.toBe(mapped_database_games[uuid].max_score)

			expect(mapped_response_games[uuid].private)
				.toBe(!!mapped_database_games[uuid].password)
		}
	})

	afterAll(async () => {
		await redis_client.disconnect()
	})
})
