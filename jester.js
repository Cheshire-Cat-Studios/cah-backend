require('dotenv').config()

const commands = require('./config/commands'),
	options = require('minimist')(process.argv.slice(2)),
	colour = require('./helpers/colour')

//if the command is mapped and exists run it, if not alert the user
commands[options._[0]]
	? (
		async () => {
			await (new (commands[options._[0]])(options)).handle()

			process.exit(0)
		}
	)()
	: colour.error(`command: ${options._[0]} does not exist`)