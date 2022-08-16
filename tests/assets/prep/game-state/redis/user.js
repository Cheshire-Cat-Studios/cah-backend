const
	keys = require('../../../../config/redis/keys')

function getPlayisKey(key, player_uuid) {
	return keys.player
		[key]
		?.replace('#', player_uuid || this.socket.user.uuid)

}

module.exports = async (game, users) => {






}