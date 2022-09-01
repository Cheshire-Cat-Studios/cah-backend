module.exports = route => {
	route()
		.setPath('users')
		.setName('users')
		.group(require('./user'))

	route()
		.setPath('games')
		.setName('games')
		.group(require('./game'))
}