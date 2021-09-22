const Command = require('./Command'),
    colour = require('../helpers/colour')

module.exports = class Migrate extends  Command{
    handle() {
        colour.comment('Please see below for viable commands')
        colour.comment('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        colour.comment('migrate ~ will create and populate the database')
    }
}