import InitialiseAction from '../../sockets/GameActions/InitialiseAction.js'
import DisconnectAction from '../../sockets/GameActions/DisconnectAction.js'
import StartGameAction from '../../sockets/GameActions/StartGameAction.js'
import CzarChosenAction from '../../sockets/GameActions/CzarChosenAction.js'
import CardsChosenAction from '../../sockets/GameActions/CardsChosenAction.js'
import LeaveAction from '../../sockets/GameActions/LeaveAction.js'
import {RedisConnection} from '@cheshire-cat-studios/jester'

const mappings = {
	'initialise': InitialiseAction,
	'leave': LeaveAction,
	'error': DisconnectAction,
	'start-game': StartGameAction,
	'czar-chosen': CzarChosenAction,
	'cards-chosen': CardsChosenAction
}

export default async (event, socket, data = null) => {
	await (new mappings[event])
		.setSocket(socket)
		.setIo(socket)
		.setRedis(
			await RedisConnection.getClient()
		)
		.handle(data)
}