const Command = require('./Command'),
    migrations = require('../database/migrations'),
    seeders = require('../database/seeders'),
    fs = require('fs'),
    colour = require('../helpers/colour'),
    Query = require('../database/query/Query')


module.exports = class Migrate extends Command {
    name = 'migration'
    description = 'will create and populate the database'

    handle() {
        //TODO: exceptions in logic for in memory db's and randomly deleting any fucking files based on the env

        if (
            this.options.fresh
            && fs.existsSync(process.env.SQLITE_FILE)
        ) {
            fs.unlinkSync(process.env.SQLITE_FILE)

            colour.success('Database wiped')

            fs.writeFileSync(process.env.SQLITE_FILE, '')
            fs.chmodSync(process.env.SQLITE_FILE, 0o765)

            colour.success('Database rebuilt')

            const DataBaseService = new (require('../services/DatabaseService'))

            migrations.forEach(fn => {
                const migration = fn()

                DataBaseService
                    .database
                    .prepare(migration.parse())
                    .run()

                colour.success(migration.table_name + ' table successfully created')

            })

            this.options.seed
            && require('../database/seeders/index')()
        }

    }
}