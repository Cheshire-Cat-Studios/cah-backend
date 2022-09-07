const {
	Migrate,
	Help,
	Query
} = require('jester').commands

module.exports = {
	'migrate': Migrate,
	'help': Help,
	'query': Query,
}