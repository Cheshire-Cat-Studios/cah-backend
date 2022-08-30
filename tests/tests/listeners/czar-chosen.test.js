const redis_client = require('../../../modules/redis'),
	prepareGame = require('../../assets/prep/prepare-game'),
	game_data = require('../../mocks/game-data')
		.reset()
		.init(),
	fireListener = require('../../mocks/fire-listener'),
	prepareDatabase = require('../../assets/prep/database'),
	prepareRedis = require('../../assets/prep/redis'),
	getGameKey = require('../../../helpers/getRedisKey/game'),
	randomiseArray = require('../../../helpers/randomiseArray')

let mocked_user_sockets = {},
	host,
	game,
	users,
	chosen_count,
	cards = [],
	current_czar,
	original_scoreboard,
	original_cards_in_play,
	original_black_card,
	round_winner_uuid


async function gameIsUnchanged() {
	// Test scoreboard
	const scoreboard = await redis_client.hGetAll(
		getGameKey('players', game.row.id)
	)

	for (const uuid in scoreboard) {
		scoreboard[uuid] = JSON.parse(scoreboard[uuid])
	}

	expect(scoreboard)
		.toStrictEqual(original_scoreboard)

	//Test cards in play
	expect(
		await redis_client.hGetAll(
			getGameKey('cards_in_play', game.row.id)
		)
	)
		.toStrictEqual(original_cards_in_play)


	// Test is czar phase
	expect(
		JSON.parse(
			await redis_client.hGet(
				getGameKey('state', game.row.id),
				'is_czar_phase'
			)
		)
	)
		.toBe(true)

	//Czar is unchanged
	expect(
		current_czar
	)
		.toBe(
			await redis_client.hGet(
				getGameKey('state', game.row.id),
				'current_czar'
			)
		)
}

describe('Cards chosen event listener', () => {
	beforeAll(async done => {
		await prepareDatabase()
		await prepareRedis();

		(
			{
				game,
				users,
				mocked_user_sockets
			} = await prepareGame(
				5,
				true,
				true,
				3
			)
		)

		for (const user of users) {
			await fireListener(
				'initialise',
				mocked_user_sockets[user.row.uuid]
			)
		}

		current_czar = await redis_client.hGet(
			getGameKey('state', game.row.id), 'current_czar'
		)

		original_cards_in_play = await redis_client.hGetAll(
			getGameKey('cards_in_play', game.row.id)
		)

		original_scoreboard = await redis_client.hGetAll(
			getGameKey('players', game.row.id)
		)

		for (const uuid in original_scoreboard) {
			original_scoreboard[uuid] = JSON.parse(original_scoreboard[uuid])
		}

		original_black_card = await redis_client.lRange(
			getGameKey('deck', game.row.id),
			0,
			0
		)
			[0]

		done()
	})

	test('Non czar cannot choose a winner', async () => {
		const not_czar = randomiseArray(
			users.filter(
				user => user.row.uuid !== current_czar
			)
		)

		await fireListener(
			'czar-chosen',
			mocked_user_sockets[not_czar.row.uuid],
			randomiseArray(Object.keys(original_cards_in_play))
		)

		await gameIsUnchanged()
	})

	test('Czar cannot choose self', async () => {
		await fireListener(
			'czar-chosen',
			mocked_user_sockets[current_czar],
			current_czar
		)

		await gameIsUnchanged()
	})

	test('Czar cannot choose a player who hasn\'t chosen cards', async () => {
		const user = randomiseArray(
			users.filter(user =>
				!Object.keys(original_cards_in_play)
					.includes(user.row.uuid)
				&& user.row.uuid !== current_czar
			)
		)

		await fireListener(
			'czar-chosen',
			mocked_user_sockets[current_czar],
			user.row.uuid
		)

		await gameIsUnchanged()
	})

	test('Czar cannot choose a player who doesn\'t exist', async () => {
		await fireListener(
			'czar-chosen',
			mocked_user_sockets[current_czar],
			'UUID_DOESNT_EXIST'
		)

		await gameIsUnchanged()
	})

	test('Czar can choose a player who has chosen cards', async () => {
		round_winner_uuid = randomiseArray(
			Object.keys(original_cards_in_play)
		)

		await fireListener(
			'czar-chosen',
			mocked_user_sockets[current_czar],
			round_winner_uuid
		)

		expect(
			JSON.parse(
				await redis_client.hGet(
					getGameKey('state', game.row.id),
					'is_czar_phase'
				)
			)
		)
			.toBe(false)
	})

	test('-- Only player who won round gains a point', async () => {
		const scoreboard = await redis_client.hGetAll(
			getGameKey('players', game.row.id)
		)

		//Test redis scoreboard
		for (const uuid in scoreboard) {
			scoreboard[uuid] = JSON.parse(scoreboard[uuid])

			expect(
				scoreboard[uuid].score
			).toBe(
				uuid === round_winner_uuid
					? original_scoreboard[uuid].score + 1
					: original_scoreboard[uuid].score
			)
		}

		//TODO: FE scoreboard is an array, more thought required
		//
		// for (const uuid in game_data.player_data) {
		// 	for (const scoreboard_uuid in game_data.player_data[uuid].scoreboard) {
		// 		console.log(
		// 			scoreboard_uuid,
		// 			game_data.player_data[uuid].scoreboard
		// 		)
		// 	}
		// }

	})

	test('-- Black card has changed', async () => {
		const new_black_card = (await redis_client.lRange(
			getGameKey('deck', game.row.id),
			0,
			0
		))[0]

		//Test redis
		expect(
			new_black_card
		)
			.not
			.toBe(original_black_card)

		//Test game data
		for (const uuid in game_data.player_data) {
			expect(game_data.player_data[uuid].black_card)
				.toBe(new_black_card)
		}
	})

	test('-- Czar has changed', async () => {
		const new_czar = await redis_client.hGet(
				getGameKey('state', game.row.id),
				'current_czar'
			),
			czar_name = users.filter(user => user.row.uuid === new_czar)
				[0]
				.row
				.name

		//Test redis
		expect(
			new_czar
		)
			.not
			.toBe(current_czar)

		//Test game data
		for (const uuid in game_data.player_data) {
			for (const player of game_data.player_data[uuid].scoreboard) {
				expect(!!player.is_czar)
					.toBe(player.name === czar_name)
			}
		}
	})

	test('-- Is no longer czar phase', async () => {
		//Test redis
		expect(
			JSON.parse(
				await redis_client.hGet(
					getGameKey('state', game.row.id),
					'is_czar_phase'
				)
			)
		)
			.toBe(false)

		//Test game data
		for (const uuid in game_data.player_data) {
			expect(game_data.player_data[uuid].is_czar_phase)
				.toBe(false)
		}
	})

	test('-- Cards in play have been cleared', async () => {
		//Test redis
		expect(
			(await redis_client.hKeys(
				getGameKey('cards_in_play', game.row.id)
			))
				.length
		)
			.toBe(0)

		//Test game data
		for (const uuid in game_data.player_data) {
			expect(game_data.player_data[uuid].cards_in_play)
				.toStrictEqual({})
		}
	})

	test('If winner hits score limit, game ends', async () => {
		//TODO: abstract into a method? --------
		await prepareDatabase()
		await prepareRedis();

		(
			{
				game,
				users,
				mocked_user_sockets
			} = await prepareGame(
				5,
				true,
				true,
				3,
				1
			)
		)

		for (const user of users) {
			await fireListener(
				'initialise',
				mocked_user_sockets[user.row.uuid]
			)
		}
		// ---------

		current_czar = await redis_client.hGet(
			getGameKey('state', game.row.id), 'current_czar'
		)

		original_cards_in_play = await redis_client.hGetAll(
			getGameKey('cards_in_play', game.row.id)
		)

		round_winner_uuid = randomiseArray(
			Object.keys(original_cards_in_play)
		)

		const winner_name = users.filter(
			user => user.row.uuid === round_winner_uuid
		)
			[0]
			.row
			.name

		await fireListener(
			'czar-chosen',
			mocked_user_sockets[current_czar],
			round_winner_uuid
		)

		expect(
			!!await redis_client.exists(
				getGameKey('state', game.row.id)
			)
		)
			.toBe(false)

		expect(
			!!await redis_client.exists(
				getGameKey('deck', game.row.id)
			)
		)
			.toBe(false)

		expect(
			!!await redis_client.exists(
				getGameKey('players', game.row.id)
			)
		)
			.toBe(false)

		expect(
			!!await redis_client.exists(
				getGameKey('cards_in_play', game.row.id)
			)
		)
			.toBe(false)

		for (const uuid in game_data.player_data) {
			expect(
				game_data.player_data
					[uuid]
					.winner_name
			)
				.toBe(winner_name)
		}
	})

	afterAll(async done => {
		await redis_client.disconnect()

		done()
	})
})