//TODO: make index.js in rules folder so i can do const {x,y,z} = require('')

const Validation = require('./Validation'),
	Required = require('./rules/Required'),
	Min = require('./rules/Min'),
	Max = require('./rules/Max'),
	Unique = require('./rules/Unique'),
	Unique = require('./rules/Unique')

module.exports = class CreateGameValidation extends Validation {
	getRules() {
		return {
			name: [
				new Min(3),
				new Max(10),
				new Unique('games', 'name'),
			],
			password: [
				new Nullable(),
				new Max(20),
			],
			host_id: [

			],
			is_started: [

			],
			is_czar_phase: [

			],
			max_score: [

			],
			max_players: [

			],
			round_time_limit_mins: [

			],
			game_time_limit_mins: [

			],
			secret: [

			],
		}
	}
}