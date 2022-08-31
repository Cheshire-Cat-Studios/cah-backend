const
	{Validation} = require('jester'),
	{
		Required,
		Min
	} = require('jester').rules,
	Unique = require('./rules/Unique')

module.exports = class CreateUserValidation extends Validation {
	getRules() {
		return {
			name: [
				new Required(),
				new Min(4),
				new Unique('users', 'name'),
			]
		}
	}
}