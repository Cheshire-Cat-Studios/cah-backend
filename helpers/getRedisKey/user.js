const keys = require('../../config/redis/keys')

module.exports = (key, uuid) =>
	keys.player
		[key]
		?.replace(
			'#',
			uuid
		)