const redis_client = require('../../../../../modules/redis'),
	prepareGame = require('../../../../assets/prep/prepare-game'),
	createSocketClient = require('../../../../assets/prep/sockets/client'),
	getGameKey = require('../../../../../helpers/getRedisKey/game'),
	runQueue = require('../../../../../queue/run-queue')

describe('Socket client: game-state event', () => {
	let
		host,
		server,
		io,
		serverSocket,
		game,
		users,
		connected_count = 0,
		connected_client_sockets = {},
		client_sockets_data = {}

	beforeAll(async (done) => {
		({server, io} = require('../../../../../server'))

		io.on('connection', socket => {
			serverSocket = socket
		})

		connected_client_sockets = {}
		client_sockets_data = {};
		({game, users} = await prepareGame())

		host = users.filter(user => user.row.id === game.row.host_id)[0].row

		let connected_count = 0,
			started_count = 0

		for (const user of users) {
			const client_socket = createSocketClient(user)

			connected_client_sockets[user.row.uuid] = client_socket

			client_socket.on(
				'connect',
				async () => {
					connected_count++

					if (connected_count === users.length) {
						connected_count = 0

						connected_client_sockets[host?.uuid]
							.emit('start-game')

						setTimeout(
							async () => {
								await runQueue(game.row.id, true)
							},
							100
						)

					}
				}
			)

			client_socket.on(
				'game-started',
				data => {
					started_count++
					client_sockets_data[user.row.uuid] = data

					if (started_count === users.length) {
						done()
					}
				}
			)
		}
	})


	afterAll(async done => {
		await redis_client.quit()

		for (const uuid in connected_client_sockets) {
			connected_client_sockets[uuid]
				.close()
		}

		await server.close()
	})

	test('Every player has data', () => {
		expect(
			Object.keys(client_sockets_data)
				.length
		)
			.toBe(users.length)
	})

	test('Every player has correct is_czar data', async () => {
		const czar = await redis_client.hGet(getGameKey('state', game.row.id), 'current_czar')

		for (const uuid of Object.keys(client_sockets_data)) {
			expect(client_sockets_data[uuid].is_czar)
				.toBe(czar === uuid)
		}
	})
})