require('dotenv').config()

const
	prepareDatabase = require('./database'),
	prepareRedis = require('./redis'),
	gameStateDatabase = require('./game-state/database'),
	gameStateRedis = require('./game-state/redis/game'),
	redis_client = require('../../../modules/redis'),
	runQueue = require('../../../queue/run-queue'),
	createSocketMock = require('../../mocks/socket')

module.exports = async (
	player_count = 2,
	is_started = false,
	is_czar_phase = false,
	players_with_cards_in_play_count = 0,
	max_score = 10
) => {
	// await prepareDatabase()
	// await prepareRedis()

	const {game, users} = await gameStateDatabase(
		player_count,
		max_score
	)

	await gameStateRedis(
		game,
		users,
		is_started,
		is_czar_phase,
		players_with_cards_in_play_count
	)

	let mocked_user_sockets = {}

	for (const user of users) {
		mocked_user_sockets[user.row.uuid] = createSocketMock(user)
	}


	return {
		game,
		users,
		mocked_user_sockets
	}
}