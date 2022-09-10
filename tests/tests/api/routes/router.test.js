const
	request = require('supertest'),
	app = require('express')(),
	{Router, Route, Controller} = require('jester'),
	sendJsend = require('../../../../helpers/sendJsend'),
	test_get_response = {
		abc: 123
	},
	test_post_response = {
		123: 'abc'
	}

describe('Router/Routes', () => {
	beforeAll(async done => {
		const route = (new Route())
		const TestController = class TestController extends Controller {
			post() {
				this.sendJsend(
					200,
					'status',
					test_post_response
				)
			}

			get() {
				this.sendJsend(
					200,
					'status',
					test_get_response
				)
			}
		}


		route.group(route => {
			route().post(
				'post',
				(req, res) => {
					sendJsend(
						res,
						200,
						'status',
						test_post_response
					)
				}
			)

			route().get(
				'get',
				(req, res) => {
					sendJsend(
						res,
						200,
						'status',
						test_get_response
					)
				}
			)

			route().post(
				'controller-post',
				TestController,
				'post'
			)

			route().get(
				'controller-get',
				TestController,
				'get'
			)

		});

		new Router()
			.setApp(app)
			.setRoute(route)
			.parseRoutes()

		done()
	})

	test('Post request is successful and expected data given in response', async () => {
		const response = await request(app)
				.post('/post'),
			response1 = await request(app)
				.post('/controller-post')

		expect(response.statusCode)
			.toBe(200)

		expect(response.body?.data)
			.toMatchObject(test_post_response)

		expect(response1.statusCode)
			.toBe(200)

		expect(response1.body?.data)
			.toMatchObject(test_post_response)
	})


	test('Get request is successful and expected data given in response', async () => {
		const response = await request(app)
				.get('/get'),
			response1 = await request(app)
				.get('/controller-get')

		expect(response.statusCode)
			.toBe(200)

		expect(response.body?.data)
			.toMatchObject(test_get_response)

		expect(response1.statusCode)
			.toBe(200)

		expect(response1.body?.data)
			.toMatchObject(test_get_response)
	})

	test('Incorrect http verb causes a 404', async () => {
		const response = await request(app)
				.post('/get'),
			response2 = await request(app)
				.post('/controller-get')

		expect(response.statusCode)
			.toBe(404)

		expect(response2.statusCode)
			.toBe(404)
	})

	test('Incorrect uri causes a 404', async () => {
		const response = await request(app)
			.post('/doesnt-exist')

		expect(response.statusCode)
			.toBe(404)
	})

	afterAll(async done => {
		const {RedisConnection} = require('jester')

		await (
			await RedisConnection.getClient()
		)
			.disconnect()


		done()
	})
})
