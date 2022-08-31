const keys = require('../../config/redis/keys')

module.exports = (key, id) =>
	keys.player
		[key]
		?.replace(
			'#',
			id
		)