import {
    Validation,
    Required,
    Min,
    Nullable,
} from '@cheshire-cat-studios/jester'

class ActionEventValidation extends Validation {
    getRules() {
        return {
            type: [
                new Required(),
                new Min(1),
            ],
            data: [
                new Nullable()
            ]
        }
    }
}

export default ActionEventValidation