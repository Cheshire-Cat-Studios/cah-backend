import {RedisConnection} from '@cheshire-cat-studios/jester'
import getUserRedisKey from '../helpers/getRedisKey/user.js'
import pushToQueue from '../queue/push-to-queue.js'
import AuthenticatedSocket from './AuthenticatedSocket.js'


//TODO: abstract into config
const mappings = [
    'leave',
    'error',
    'start-game',
    'czar-chosen',
    'cards-chosen',
    'disconnect'
]

class EventHandler {
    socket:AuthenticatedSocket

    setSocket(socket:AuthenticatedSocket) {
        this.socket = socket

        return this
    }

    handle() {
        for (const mapping of mappings) {
            this.socket.on(
                mapping,
                async (...data) => {
                    // console.log('set true')
                    // console.log(getUserRedisKey('is_active', this.socket.user.uuid))
                    await (await RedisConnection.getClient()).set(
                        getUserRedisKey('is_active', this.socket.user.uuid),
                        'true'
                    )

                    await pushToQueue(
                        this.socket.id,
                        this.socket.user.current_game,
                        this.socket.user.id,
                        mapping,
                        [...data]
                    )
                }
            )
        }
    }
}

export default EventHandler