import {
    EventServiceProvider,
    RedisConnection,
    app
} from '@cheshire-cat-studios/jester'
import prepareGame from '../../assets/prep/prepare-game'
import InitialiseAction from '../../../sockets/GameActions/InitialiseAction'
import DisconnectAction from '../../../sockets/GameActions/DisconnectAction'
import prepareDatabase from '../../assets/prep/database'
import prepareRedis from '../../assets/prep/redis'
import GameData from '../../mocks/GameData'
import {describe, expect, beforeAll, test, afterAll, vi} from 'vitest'

GameData.reset()

let users,
    redis_client,
    mocked_user_sockets,
    event_queued = false

vi.mock(
    '../../../events/UserLeft.js',
    () => {
        class UserLeft {
            event_name = 'user-left'
            async = false

            handle() {
                event_queued = true
            }
        }

        return {default: UserLeft}
    }
)

describe('Disconnect event listener', () => {
    beforeAll(async () => {
        redis_client = await RedisConnection.getClient()

        await prepareDatabase()
        await prepareRedis();

        // await new EventServiceProvider(await app())
        //     .handle();

        ({users, mocked_user_sockets} = await prepareGame(3))

        for (const user of users) {
            await new InitialiseAction()
                .setSocket(mocked_user_sockets[user.row.uuid])
                .setIo(mocked_user_sockets[user.row.uuid])
                .setRedis(redis_client)
                .handle()
        }
    })

    test('If user disconnects a user-left event is fired', async () => {
        const user = users[0]

        await new DisconnectAction()
            .setSocket(mocked_user_sockets[user.row.uuid])
            .setIo(mocked_user_sockets[user.row.uuid])
            .setRedis(redis_client)
            .handle()


        expect(
            event_queued
        )
            .toBe(true)
    })

    afterAll(async () => {
        await RedisConnection.disconnect()
        // await redis_client.disconnect()
    })
})