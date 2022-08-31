const
	{Validation} = require('jester'),
	{
		Required,
		Min,
		Max,
		Unique,
	} = require('./rules')

module.exports = class CreateUserValidation extends Validation {
	getRules() {
		return {
			name: [
				new Required(),
				new Min(4),
				new Max(25),
				new Unique('users', 'name'),
			]
		}
	}
}