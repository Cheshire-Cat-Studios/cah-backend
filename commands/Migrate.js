const Command = require('./Command'),
    migrations = require('../database/migrations'),
    seeders = require('../database/seeders'),
    fs = require('fs'),
    colour = require('../helpers/colour')


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

            Object.keys(migrations)
                .forEach(table_name => {
                    DataBaseService.createTable(table_name, migrations[table_name])
                    colour.success(table_name + 'table successfully created')
                })

            this.options.seed
            && Object.keys(seeders).forEach(table_name => {
                for (let i = 0; i < 3; i++) {
                    DataBaseService.insert(table_name, seeders[table_name]())
                }

                colour.success(table_name + 'table successfully seeded')
            })
        }

    }
}