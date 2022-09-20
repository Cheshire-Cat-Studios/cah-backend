import {Factory} from '@cheshire-cat-studios/jester'
import Game from '../../models/Game.js'
import createUniqueId from '../../helpers/createUniqueId.js'

class GameFactory extends Factory {
    constructor() {
        super()
        this.model = new Game
    }

    schema(): Object {
        return {
            // id: null,
            uuid: createUniqueId('game'),
            name: `${this.faker.word.adjective()} ${this.faker.word.noun()}`,
            password: this.faker.random.alpha(25),
            host_id: this.faker.datatype.number(),
            // is_started: + this.faker.datatype.boolean(),
            max_score: this.faker.datatype.number({min:10, max:20}),
            max_players: this.faker.datatype.number({min: 3, max: 10}),
            round_time_limit_mins: this.faker.datatype.number({min:5, max:20}),
            game_time_limit_mins: this.faker.datatype.number({min:10, max:60}),
        }
    }
}

export default GameFactory