const
	{Migrate} = require('jester').commands,
	fresh = true,
	noLog = true

module.exports = async () => {
	await (new Migrate({
		fresh,
		noLog
	}))
		.handle()
}