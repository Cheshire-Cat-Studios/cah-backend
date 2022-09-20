import {
	Validation,
	Required,
	Min,
	Unique
} from '@cheshire-cat-studios/jester'

class JoinGameValidation extends Validation {
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

export default JoinGameValidation