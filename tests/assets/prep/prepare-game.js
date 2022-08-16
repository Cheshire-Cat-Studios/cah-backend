require('dotenv').config()

const
	prepareDatabase = require('./database'),
	prepareRedis = require('./redis'),
	gameStateDatabase = require('./game-state/database'),
	gameStateRedis = require('./game-state/redis/game'),
	redis_client = require('../../../modules/redis'),
	runQueue = require('../../../queue/run-queue')

module.exports = async (
	{
		password = '',
		max_score = 5,
		max_players = 2
	} = {
		password: '',
		max_score: 5,
		max_players: 2
	},
	player_count = 2
) => {
	await prepareDatabase()
	await prepareRedis()

	const {game, users} = await gameStateDatabase(
		{
			password,
			max_score,
			max_players
		},
		player_count
	)

	await gameStateRedis(game)

	return {
		game,
		users
	}
}