const
	{
		Validation,
		rules: {
			Required,
			Min,
			Max,
			Unique,
		}
	} = require('jester')

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