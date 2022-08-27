const
	CahInitialiseGameListener = require('../../sockets/listeners/cah/CahInitialiseGameListener'),
	CahDisconnectListener = require('../../sockets/listeners/cah/CahDisconnectListener'),
	CahStartGameListener = require('../../sockets/listeners/cah/CahStartGameListener'),
	CahCzarChosenListener = require('../../sockets/listeners/cah/CahCzarChosenListener'),
	CahCardsChosenListener = require('../../sockets/listeners/cah/CahCardsChosenListener'),
	mappings = {
		'initialise': CahInitialiseGameListener,
		'leave': CahDisconnectListener,
		'error': CahDisconnectListener,
		'start-game': CahStartGameListener,
		'czar-chosen': CahCzarChosenListener,
		'cards-chosen': CahCardsChosenListener
	}

module.exports = async (event, socket, data) => {
	await (new mappings[event])
		.setSocket(socket)
		.setIo(socket)
		.handle(data)
}