const Command = require('./Command'),
    DataBaseService = new(require('../services/DatabaseService')),
    migrations = require('../database/migrations'),
    seeders = require('../database/seeders'),
    fs = require('fs'),
    colour = require('../helpers/colour')

module.exports = class Query extends Command{
    description = 'will create and populate the database'

    handle(){
        try{
            if(!this.options.table){
                throw new Error('--table is a required parameter!')
            }

            console.log(this.options)
            console.log((new (require('../services/DatabaseService'))).selectFrom('games'))

            //TODO: implement models or something similar
            // this.options.id
            //     ? DataBaseService.selectFrom(this.options.table)
            //     : DataBaseService.selectFrom(this.options.table)

        }catch (e){
            colour.error(e.toString())
        }
    }
}