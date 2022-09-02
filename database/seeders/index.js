module.exports = async () => {
	await require('../seeders/game')()
	await require('../seeders/user')()
}