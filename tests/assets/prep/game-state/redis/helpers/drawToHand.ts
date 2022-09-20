import getUserRedisKey from '../../../../../../helpers/getRedisKey/user.js'
import {RedisConnection} from '@cheshire-cat-studios/jester'
import User from '../../../../../../models/User.js';

export default async (user: User, draw_count:number = 10) => {
    const redis_client = await RedisConnection.getClient()

    await redis_client.lPush(
        getUserRedisKey('hand', user.row.uuid),
        await redis_client.sendCommand([
            'LPOP',
            getUserRedisKey('deck', user.row.uuid),
            draw_count + '',
        ]),
    )
}


