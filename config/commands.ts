import {
	Migrate,
	Help,
	QueryCommand
} from '@cheshire-cat-studios/jester'
import DeleteInactiveUsers from '../commands/DeleteInactiveUsers.js'
import EndOverrunningGames from '../commands/EndOverrunningGames.js'
import KickDisconnectedUsers from '../commands/KickDisconnectedUsers.js'
import EndOverrunningRounds from '../commands/EndOverrunningRounds.js'

export default {
	'migrate': Migrate,
	'help': Help,
	'query': QueryCommand,
	'delete-inactive-users': DeleteInactiveUsers,
	'end-games': EndOverrunningGames,
	'end-rounds': EndOverrunningRounds,
	'kick-disconnected-users': KickDisconnectedUsers,
}