const Command = require('./Command'),
	GameModel = require('../models/Game'),
	Query = require('../database/query/Query')

module.exports = class Test extends Command {
	async handle() {

		console.log(
			await(
				await new GameModel()
				.create({
					host_id: 1,
					uuid: 'aefeafeafafaf',
					name: 'new game',
					password: 'password',
					max_score: 10,
					max_players: 10,
					round_time_limit_mins: 10,
					game_time_limit_mins:  10,
				}))
				.update({
					uuid: 'test',
				})
		)

	}
}