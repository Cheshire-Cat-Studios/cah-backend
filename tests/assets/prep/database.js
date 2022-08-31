const Migrate = require('../../../commands/Migrate'),
	fresh = true,
	noLog = true

module.exports = async () => {
	await (new Migrate({
		fresh,
		noLog
	}))
		.handle()
}