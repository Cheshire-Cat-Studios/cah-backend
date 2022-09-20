import {
    Event,
    RedisConnection
} from '@cheshire-cat-studios/jester'
import pushToQueue  from '../queue/push-to-queue.js'
import getUserKey from '../helpers/getRedisKey/user.js'

//TODO: abstract into config
const timeout = 5000

class UserLeft extends Event {
    constructor() {
        super('user-left', true)
    }

    async handle(socket_id: string, user_id: number, game_id: number): Promise<void> {
        const redis_client = await RedisConnection.getClient()

        await new Promise(
            resolve => setTimeout(resolve, timeout)
        )

        const is_active = await redis_client.get(getUserKey('is_active', user_id+''))

        if (is_active && JSON.parse(is_active)) {
            return
        }

        await pushToQueue(
            socket_id,
            game_id,
            user_id,
            'leave'
        )
    }
}

export default UserLeft