const request = require('supertest'),
	app = require('express')(),
	Router = require('../../../../routes/Router'),
	Route = require('../../../../routes/Route'),
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
		});


		(new Router)
			.setApp(app)
			.setRoute(route)
			.parseRoutes()

		done()
	})

	test('Post request is successful and expected data given in response', async () => {
		const response = await request(app)
			.post('/post')

		expect(response.statusCode)
			.toBe(200)

		expect(response.body?.data)
			.toMatchObject(test_post_response)
	})


	test('Get request is successful and expected data given in response', async () => {
		const response = await request(app)
			.get('/get')

		expect(response.statusCode)
			.toBe(200)

		expect(response.body?.data)
			.toMatchObject(test_get_response)
	})

	test('Incorrect http verb causes a 404', async () => {
		const response = await request(app)
			.post('/get')

		expect(response.statusCode)
			.toBe(404)
	})

	test('Incorrect uri causes a 404', async () => {
		const response = await request(app)
			.post('/doesnt-exist')

		expect(response.statusCode)
			.toBe(404)
	})

})
