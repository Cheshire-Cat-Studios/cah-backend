const
	{
		Validation,
		rules: {
			Required,
			Min,
			Max,
		}
	} = require('jester'),
	Unique = require('../validation/rules/Unique')

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