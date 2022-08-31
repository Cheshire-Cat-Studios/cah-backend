const keys = require('../../config/redis/keys')

module.exports = (key, id) =>
	keys.game
		[key]
		?.replace(
			'#',
			id
		)