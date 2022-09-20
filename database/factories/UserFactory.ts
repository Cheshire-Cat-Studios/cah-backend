import {Factory} from '@cheshire-cat-studios/jester'
import User from '../../models/User.js'
import createUniqueId from '../../helpers/createUniqueId.js'

class UserFactory extends Factory {
    constructor() {
        super()
        this.model = new User
    }

    schema(): Object {
        return {
            uuid: createUniqueId('user'),
            name: this.faker.name.firstName(),
            current_game: null,
        }
    }
}

export default UserFactory