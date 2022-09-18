import DisconnectAction from '../sockets/GameActions/DisconnectAction.js'
import LeaveAction from '../sockets/GameActions/LeaveAction.js'
import StartGameAction from '../sockets/GameActions/StartGameAction.js'
import CzarChosenAction from '../sockets/GameActions/CzarChosenAction.js'
import CardsChosenAction from '../sockets/GameActions/CardsChosenAction.js'
import InitialiseAction from '../sockets/GameActions/InitialiseAction.js'

import User from '../models/User.js'
import SocketConnection from '../connections/SocketConnection.js';

import {RedisConnection} from '@cheshire-cat-studios/jester'

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

export default async (
    game_id: number | string,
    only_run_once: boolean = false,
    timeout_ms: number = 100,
    batch_size: number = 10
) => {
    const redis_client = await RedisConnection.getClient()

    while (true) {
        const io = SocketConnection.io

        if (
            !await redis_client.exists(`game.${game_id}.state`)
        ) {
            break
        }

        let batch: Array<string> = await redis_client.sendCommand([
            'LPOP',
            `game.${game_id}.events-queue`,
            batch_size + '',
        ])


        if (batch?.length) {
            for (const event_string of batch) {
                const {socket_id, user_id, game_id, event_key, event_data} = JSON.parse(event_string),
                    socket = io.sockets.sockets.get(socket_id)

                console.log(
                    socket_id,
                    user_id,
                    game_id,
                    event_key,
                    event_data
                )


                await (new mappings[event_key])
                    .setSocket(
                        socket
                        || {
                            user: (await new User().find(user_id)).row
                        }
                    )
                    .setIo(io)
                    .setRedis(redis_client)
                    .handle(...event_data, user_id)
            }
        }

        if (only_run_once) {
            break
        } else {
            await new Promise(
                resolve => setTimeout(resolve, timeout_ms)
            )
        }
    }
}

 