const Command = require('./Command'),
	path = require('path'),
	migrations = require(path.join(process.cwd(), 'database/migrations')),
	// fs = require('fs'),
	colour = require('../helpers/colour'),
	mysql = require('../modules/mysql')


module.exports = class Migrate extends Command {
	name = 'migration'
	description = 'will create and populate the database'

	async handle() {
		if (this.options.fresh) {
			//TODO: refactor migrations with up and down actions
			for (const fn of migrations) {
				await mysql.query(`DROP TABLE IF EXISTS ${fn().table_name}`)
			}

			!this.options.noLog
			&& colour.success('Database wiped')

			for (const fn of migrations) {
				const migration = fn()

				await mysql.query(migration.parse())

				!this.options.noLog
				&& colour.success(migration.table_name + ' table successfully created')

			}

			this.options.seed
			&& await require(path.join(process.cwd(), 'database/seeders'))()

			process.exit(0)
		}
	}
}