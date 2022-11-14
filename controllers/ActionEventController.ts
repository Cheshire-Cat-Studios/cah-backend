import {Controller, RedisConnection} from '@cheshire-cat-studios/jester'
import InitialiseAction from '../gameActions/InitialiseAction.js'
import LeaveAction from '../gameActions/LeaveAction.js'
import DisconnectAction from '../gameActions/DisconnectAction.js'
import StartGameAction from '../gameActions/StartGameAction.js'
import CzarChosenAction from '../gameActions/CzarChosenAction.js'
import CardsChosenAction from '../gameActions/CardsChosenAction.js'
import SocketConnection from "../connections/SocketConnection.js";

//TODO: abstract into config
const mappings = {
    'initialise': InitialiseAction,
    'leave': LeaveAction,
    'disconnect': DisconnectAction,
    'error': DisconnectAction,
    'start-game': StartGameAction,
    'czar-chosen': CzarChosenAction,
    'cards-chosen': CardsChosenAction
}

class ActionEventController extends Controller {
    async actionEvent(): Promise<void> {
        if (!mappings[this.req.body.type]) {
            console.log(this.req.body.type + 'EVENT HAS NO MAPPING')

            this.sendJsend(
                401,
                'error',
                {'message': 'Event has no corresponding action'}
            )

            return
        }

        const io = SocketConnection.io,
            {socket_id, user_id, game_id, event_data} = JSON.parse(this.req.body.data),
            socket = io.sockets.sockets.get(socket_id)

        console.log(this.req.body.data)
        // console.log(socket_id)
        // console.log(user_id)
        // console.log(game_id)
        // console.log(event_data)
        // console.log(socket)

        // console.log(io.sockets.sockets)

        if(socket){
            await (new mappings[this.req.body.type])
                .setSocket(
                    socket
                    // || {
                    //     user: (await new User().find(user_id)).row
                    // }
                )
                .setIo(io)
                .setRedis(await RedisConnection.getClient())
                .handle(event_data, user_id)

            this.sendJsend(200, 'success', {})

            return
        }

        this.sendJsend(
            401,
            'error',
            {
                'message': 'socket id does not correspond to an existing connection'
            }
        )
    }
}

export default ActionEventController