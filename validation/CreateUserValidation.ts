import {
    Validation,
    Required,
    Min,
    Max,
    Unique,
} from '@cheshire-cat-studios/jester'

class CreateUserValidation extends Validation {
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

export default CreateUserValidation