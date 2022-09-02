const Command = require('./Command'),
    colour = require('../helpers/colour'),
    commands = require('../commands')


module.exports = class Help extends Command {
    name = 'help'

    handle() {

        colour.comment('Please see below for viable commands and their options')
        colour.comment('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')


        Object.keys(commands)
            // .filter(command => typeof commands[command]() !== this)
            .forEach(command => {
                    console.log(commands[command]())
                    console.log(commands[command]() instanceof Help)
                }
            )

        console.log('\n')

        // Object.keys(commands)
        //     .forEach(command => {
        //         console.log(commands[command])
        //     })
    }

}