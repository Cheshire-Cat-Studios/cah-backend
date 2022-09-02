const {
	Migrate,
	Help,
	Query,
	Test,
} = require('jester').commands

module.exports = {
	'migrate': Migrate,
	'help': Help,
	'query': Query,
	'test': Test,
}