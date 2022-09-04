const
	CahInitialiseGameListener = require('../../sockets/listeners/cah/CahInitialiseGameListener'),
	CahDisconnectListener = require('../../sockets/listeners/cah/CahDisconnectListener'),
	CahStartGameListener = require('../../sockets/listeners/cah/CahStartGameListener'),
	CahCzarChosenListener = require('../../sockets/listeners/cah/CahCzarChosenListener'),
	CahCardsChosenListener = require('../../sockets/listeners/cah/CahCardsChosenListener'),
	CahLeaveListener = require('../../sockets/listeners/cah/CahLeaveListener'),
	mappings = {
		'initialise': CahInitialiseGameListener,
		'leave': CahLeaveListener,
		'error': CahDisconnectListener,
		'start-game': CahStartGameListener,
		'czar-chosen': CahCzarChosenListener,
		'cards-chosen': CahCardsChosenListener
	},
	{RedisConnection} = require('jester')

module.exports = async (event, socket, data) => {
	await (new mappings[event])
		.setSocket(socket)
		.setIo(socket)
		.setRedis(
			await RedisConnection.getClient()
		)
		.handle(data)
}