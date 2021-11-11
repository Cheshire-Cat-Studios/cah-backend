const ServiceProvider = require('./ServiceProvider'),
    DataBaseService = require('../services/DatabaseService'),
    createUniqueId = require('../helpers/CreateUniqueId'),
    migrations = require('../database/migrations')


module.exports = class RedisServiceProvider extends ServiceProvider {
    handle() {
        this.app.globals.database = new DataBaseService

        Object.keys(migrations)
            .forEach(migration => this.app.globals.database.createTable(migration, migrations[migration]))

        //TODO: create seeder concept
        const user_data = [
                {
                    id: null,
                    uuid: createUniqueId('user'),
                    name: 'one',
                    secret: '1',
                },
                {
                    id: null,
                    uuid: createUniqueId('user'),
                    name: 'two',
                    secret: '2',
                },
                {
                    id: null,
                    uuid: createUniqueId('user'),
                    name: 'three',
                    secret: '3',
                },
                {
                    id: null,
                    uuid: createUniqueId('user'),
                    name: 'four',
                    secret: '4',
                }
            ],

            game_data = [
                {
                    id: null,
                    uuid: createUniqueId('game'),
                    name: 'name',
                    password: 'password',
                    host_id: 1,
                    is_started: 0,
                    is_czar_phase: 0,
                    max_score: 0,
                    max_players: 0,
                    round_time_limit_mins: 0,
                    game_time_limit_mins: 0,
                }
            ]

        user_data.forEach(datum => {
            this.app.globals.database.insert('users', datum)
        })

        game_data.forEach(datum => {
            this.app.globals.database.insert('games', datum)
        })

        // console.log('------')
        // console.log(this.app.globals.database.database.prepare('SELECT * FROM USERS').all())
        // console.log(this.app.globals.database.database.prepare('SELECT * FROM GAMES').all())
    }
}