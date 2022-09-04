const {
	Validation,
	rules: {
		Required,
		Min,
		Unique
	}
} = require('jester')

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