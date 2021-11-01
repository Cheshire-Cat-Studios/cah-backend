const Validation = require('./Validation'),
	Required = require('./rules/Required'),
	Min = require('./rules/Min'),
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