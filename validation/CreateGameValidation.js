const Validation = require('./Validation'),
	{
		In,
		Max,
		Exists,
		Unique,
		Required,
		Nullable,
		Min,
	} = require('./rules')

module.exports = class CreateGameValidation extends Validation {
	getRules() {
		return {
			name: [
				new Min(3),
				new Max(10),
				new Unique('games', 'name'),
			],
			password: [
				new Nullable,
				new Max(20),
			],
			host_id: [
				new Required,
				new Exists('users','uuid'),
			],
			host_secret: [
				new Required,
				new Exists('users','secret'),
			],
			is_started: [
				new Nullable,
				new In([
					0,
					5,
					10,
					15,
					20
				])
			],
			max_score: [
				new In([
					0,
					5,
					10,
					15,
					20
				]),
			],
			max_players: [
				new In([
					3,
					4,
					5,
					6,
					7,
					8,
					9,
					10,
				]),
			],
			round_time_limit_mins: [
				new In([
					0,
					1,
					2,
					3,
					4,
					5,
					6,
					7,
					8,
					9,
					10,
					11,
					12,
					13,
					14,
					15,
					16,
					17,
					18,
					19,
					20,
				])
			],
			game_time_limit_mins: [
				new In([
					0,
					20,
					10,
					30,
					40,
					50,
					60,
					70,
					80,
					90,
					100,
					110,
					120,
				])
			],
		}
	}
}