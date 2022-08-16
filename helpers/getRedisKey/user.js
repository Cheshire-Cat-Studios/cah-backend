const keys = require('../../config/redis/keys')

module.exports = (key, uuid) =>
	keys.user
		[key]
		?.replace(
			'#',
			uuid
		)