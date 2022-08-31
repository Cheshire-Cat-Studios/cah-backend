const Factory = require('./Factory'),
    Game = require('../../models/Game')
    createUniqueId = require('../../helpers/createUniqueId')

module.exports = class GameFactory extends Factory{
    constructor() {
        super()
        this.model = new Game
    }

    schema(){
        return {
            // id: null,
            uuid: createUniqueId('game'),
            name: `${this.faker.word.adjective()} ${this.faker.word.noun()}`,
            password: this.faker.random.alpha(25),
            host_id: this.faker.datatype.number(1, 2),
            // is_started: + this.faker.datatype.boolean(),
            max_score: this.faker.datatype.number(10, 20),
            max_players: this.faker.datatype.number(3, 10),
            round_time_limit_mins: this.faker.datatype.number(5, 20),
            game_time_limit_mins: this.faker.datatype.number(10, 60),
        }
    }
}