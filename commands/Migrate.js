const Command = require('./Command'),
	path = require('path'),
	migrations = require(path.join(process.cwd(), 'database/migrations')),
	// fs = require('fs'),
	colour = require('../helpers/colour'),
	MysqlConnection = require('../connections/MysqlConnection')


module.exports = class Migrate extends Command {
	name = 'migration'
	description = 'will create and populate the database'

	async handle() {
		if (this.options.fresh) {
			//TODO: refactor migrations with up and down actions
			for (const fn of migrations) {
				await new MysqlConnection()
					.setQuery(`DROP TABLE IF EXISTS ${fn().table_name}`)
					.query()
			}

			!this.options.noLog
			&& colour.success('Database wiped')

			for (const fn of migrations) {
				const migration = fn()

				await new MysqlConnection()
					.setQuery(migration.parse())
					.query()

				!this.options.noLog
				&& colour.success(migration.table_name + ' table successfully created')

			}

			this.options.seed
			&& await require(path.join(process.cwd(), 'database/seeders'))()
		}
	}
}