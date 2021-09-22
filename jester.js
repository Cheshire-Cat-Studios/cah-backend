//TODO: make it use npx?
require('dotenv').config()

const commands = require('./commands'),
    arguments = require('minimist')(process.argv.slice(2)),
    colour = require('./helpers/colour')

//if the command is mapped and exists run it, if not alert the user
commands[arguments._[0]]
    ? (new (commands[arguments._[0]])(arguments)).handle()
    : colour.error(`command: ${arguments._[0]} does not exist`)