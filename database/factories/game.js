const createUniqueId = require('../../helpers/createUniqueId'),
    faker = require('faker')

module.exports = () => ({
    id: null,
    uuid: createUniqueId('game'),
    name: faker.random.words(2),
    password: faker.random.alpha(25),
    host_id: faker.datatype.number(1, 2),
    is_started: + faker.datatype.boolean(),
    is_czar_phase: + faker.datatype.boolean(),
    max_score: faker.datatype.number(10, 20),
    max_players: faker.datatype.number(3, 10),
    round_time_limit_mins: faker.datatype.number(5, 20),
    game_time_limit_mins: faker.datatype.number(10, 60),
    // secret: faker.random.alpha(25),
})