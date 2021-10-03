const Command = require('./Command'),
    commands = require('../commands')
colour = require('../helpers/colour')

module.exports = class Migrate extends Command {
    handle() {
        colour.comment('Please see below for viable commands and their options')
        colour.comment('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')

        console.log(commands)
        // Object.keys(commands)
        //     .forEach(command => {
        //         console.log(commands[command])
        //     })
    }

}