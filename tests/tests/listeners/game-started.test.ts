import GameData from "../../mocks/GameData"
import {RedisConnection} from '@cheshire-cat-studios/jester'
import prepareGame from '../../assets/prep/prepare-game'
import getGameKey from '../../../helpers/getRedisKey/game.js'
import fireListener from '../../mocks/fire-listener'
import randomiseArray from '../../../helpers/randomiseArray.js'
import prepareDatabase from '../../assets/prep/database'
import prepareRedis from '../../assets/prep/redis'
import {describe, expect, beforeAll, beforeEach, test, afterAll} from 'vitest'

GameData.reset()


let mocked_user_sockets = {},
    host,
    game,
    users,
    redis_client

describe('Game started event listener', () => {
    beforeAll(async () => {
        redis_client = await RedisConnection.getClient()

        await prepareDatabase()
        await prepareRedis()
    })

    beforeEach(async () => {
        ({game, users, mocked_user_sockets} = await prepareGame(3))

        for (const user of users) {
            await fireListener(
                'initialise',
                mocked_user_sockets[user.row.uuid]
            )
        }

        host = users.filter(user => user.row.id === game.row.host_id)[0].row

    })

    test('Every player has data', () => {
        expect(
            Object.keys(GameData.player_data)
                .length
        )
            .toBe(users.length)
    })

    test('Not host cannot start the game', async () => {
        const user = randomiseArray(
            users.filter(user => user.row.uuid !== host.uuid)
        )

        await fireListener(
            'start-game',
            mocked_user_sockets[user.row.uuid]
        )

        expect(
            !!JSON.parse(
                await redis_client.hGet(
                    getGameKey('state', game.row.id),
                    'is_started'
                )
            )
        )
            .toBe(false)
    })

    test('Host can start the game', async () => {
        await fireListener(
            'start-game',
            mocked_user_sockets[host.uuid]
        )

        expect(
            !!await redis_client.hGet(
                getGameKey('state', game.row.id),
                'is_started'
            )
        )
            .toBe(true)
    })

    test('-- Every player has correct is_czar data', async () => {
        await fireListener(
            'start-game',
            mocked_user_sockets[host.uuid]
        )

        const czar = await redis_client.hGet(
            getGameKey('state', game.row.id),
            'current_czar'
        )

        for (const uuid of Object.keys(GameData.player_data)) {
            expect(GameData.player_data[uuid].is_czar)
                .toBe(czar === uuid)
        }
    })

    afterAll(async () => {
        await redis_client.disconnect()
    })
})