const redis_client = require('../../../../../modules/redis'),
	prepareGame = require('../../../../assets/prep/prepare-game'),
	Client = require('socket.io-client'),
	createSocketClient = require('../../../../assets/prep/sockets/client'),
	getGameKey = require('../../../../../helpers/getRedisKey/game'),
	runQueue = require('../../../../../queue/run-queue'),
	socketData = require('socket-data')()

describe('Socket client: game-state event', () => {
	let
		server,
		io,
		serverSocket,
		clientSocket,
		game,
		users,
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

		let connected_count = 0,
			game_state_count = {}

		for (const user of users) {
			socketData.client_rows[user.row.uuid] = user.row

			socketData.client_rows[user.row.uuid] = user.row

			const client_socket = createSocketClient(user)



			connected_client_sockets[user.row.uuid] = client_socket

			client_socket.on(
				'connect',
				async () => {
					connected_count++

					//reset connected_count for the socket refeshes then run the queue
					if (connected_count === users.length) {
						connected_count = 0

						await runQueue(game.row.id, true)
					}
				}
			)

			client_socket.on(
				'player-joined',
				name => {
					console.log(`player named: | ${name}} | joined`)
				}
			)

			client_socket.on(
				'game-state',
				async data => {
					game_state_count[user.row.uuid] = (game_state_count[user.row.uuid] ?? 0) + 1

					if (game_state_count[user.row.uuid] === 2) {
						client_sockets_data[user.row.uuid] = data

						//If this is the last one, tell jest the before all is done
						!Object.keys(game_state_count).map(uuid => game_state_count[uuid])
							.filter(count => (count ?? 0) <= 1 )
							.length
						&& done()
					} else {
						//Refresh game-state so all users have every player in game-data
						client_socket.disconnect()
					}
				}
			)

			//reconnect any sockets that disconnect, this is done to refresh the game state
			client_socket.on(
				'disconnect', () => {
					client_socket.connect()
				}
			)
		}
	})


	afterAll(async done => {
		await redis_client.quit()

		for (const uuid in connected_client_sockets) {
			connected_client_sockets[uuid]
				.removeAllListeners()

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

	test('Every player has the correct game data', async done => {
		const player_names = users.map(user => user.row.name).sort(),
			is_czar_phase = JSON.parse(await redis_client.hGet(
				getGameKey('state', game.row.id),
				'is_czar_phase')
			),
			current_card = (
				await redis_client.lRange(
					getGameKey('deck', game.row.id),
					0,
					0
				)
			)[0],
			is_started = JSON.parse(await redis_client.hGet(
				getGameKey('state', game.row.id),
				'is_started'
			)),
			cards_in_play = await redis_client.hGetAll(getGameKey('cards_in_play', game.row.id)),
			current_czar = await redis_client.hGet(getGameKey('state', game.row.id), 'current_czar')

		for (const uuid in client_sockets_data) {
			const current_user_model = users.filter(user => user.row.uuid === uuid)?.[0],
				current_user_socket_game_data = client_sockets_data[uuid].game

			// Is current czar flag matched redis values
			expect(
				current_user_socket_game_data.is_current_czar
			)
				.toBe(
					current_czar === uuid
				)

			// Cards in play should match index length of redis values
			expect(
				current_user_socket_game_data
					.cards_in_play_count
			)
				.toBe(Object.keys(cards_in_play).length)


			// Own cards in play count matches redis values
			expect(
				current_user_socket_game_data
					.own_cards_in_play
			)
				.toBe((cards_in_play[uuid] || null))

			// Is started matches redis value
			expect(
				current_user_socket_game_data
					.is_started
			)
				.toBe(is_started)


			// Black card matches redis value
			expect(
				current_user_socket_game_data
					.current_card
			)
				.toBe(current_card)


			// Czar phase flag matches redis value
			expect(current_user_socket_game_data.is_czar_phase)
				.toBe(is_czar_phase)

			// Only the host has the is_host flag set
			expect(current_user_socket_game_data.is_host)
				.toBe(current_user_model.row.id === game.row.host_id)


			//Expect every user to be in the game.players data
			expect(
				current_user_socket_game_data
					.players
					.map(player => player.name)
					.sort()
			)
				.toStrictEqual(player_names)

			const user_self = client_sockets_data[uuid]
				.game
				.players
				.filter(player => player.is_self)
				.map(player => player.name)


			//Only one player flagged as self
			expect(user_self.length).toBe(1)

			//Self flag is set on the correct player data
			expect(user_self[0])
				.toBe(
					current_user_model?.row
						?.name
				)
		}

		done()
	})

	test('Every player has a unique hand of unique cards', () => {
		let hands = []

		for (const uuid in client_sockets_data) {
			//Hand has 10 cards
			expect(
				client_sockets_data[uuid]
					?.hand
					?.length
			)
				.toBe(10)

			const unique_cards = client_sockets_data[uuid]
				?.hand
				?.filter(
					(item, pos) =>
						client_sockets_data[uuid].hand.indexOf(item) === pos
				)

			hands.push(unique_cards)

			//All cards are unique
			expect(unique_cards.length)
				.toBe(
					client_sockets_data[uuid]
						?.hand
						?.length
				)
		}

		const unique_hands = hands.filter(
			(item, pos) =>
				hands.indexOf(item) === pos
		)

		//All hands are unique (possible that they aren't, but very very unlikely!)
		expect(unique_hands.length)
			.toBe(
				users.length
			)
	})
})