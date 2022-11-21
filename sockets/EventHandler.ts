import {CreateQueueEventService, RedisConnection} from '@cheshire-cat-studios/jester'
import getUserRedisKey from '../helpers/getRedisKey/user.js'
// import pushToQueue from '../queue/push-to-queue.js'
import AuthenticatedSocket from './AuthenticatedSocket.js'
import Game from '../models/Game.js'

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
    private socket: AuthenticatedSocket
    private game: Game

    setSocket(socket: AuthenticatedSocket): this {
        this.socket = socket

        return this
    }

    setGame(game: Game): this {
        this.game = game

        return this
    }

    handle(): void {
        for (const mapping of mappings) {
            this.socket.on(
                mapping,
                async data => {
                    // console.log('set true')
                    // console.log(getUserRedisKey('is_active', this.socket.user.uuid))
                    await (await RedisConnection.getClient()).set(
                        getUserRedisKey('is_active', this.socket.user.uuid),
                        'true'
                    )

                    const response = await new CreateQueueEventService(
                        this.game
                            .row
                            .queue_id
                    )
                        .handle(
                            mapping,
                            {
                                socket_id: this.socket.id,
                                game_id: this.socket.user.current_game,
                                user_id: this.socket.user.id,
                                event_data: data
                            }
                        )
                }
            )
        }
    }
}

export default EventHandler