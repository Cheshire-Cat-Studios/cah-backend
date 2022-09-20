import prepareGame from '../../assets/prep/prepare-game'
import createSocketMock from '../../mocks/socket'
import GameData from '../../mocks/GameData'
import InitialiseAction from '../../../sockets/GameActions/InitialiseAction'
import getGameKey from '../../../helpers/getRedisKey/game'
import prepareDatabase from '../../assets/prep/database'
import prepareRedis from '../../assets/prep/redis'
import {RedisConnection} from '@cheshire-cat-studios/jester'
import {describe, expect, beforeAll, beforeEach, test, afterAll} from 'vitest'

let mocked_user_sockets = {},
    redis_client,
    game,
    users

describe('Initialise event listener', () => {

    beforeAll(async () => {
        redis_client = await RedisConnection.getClient()

        await prepareDatabase()
        await prepareRedis();

        ({game, users, mocked_user_sockets} = await prepareGame(3))

        GameData
            .reset()

        for (const user of users) {
            await new InitialiseAction()
                .setSocket(mocked_user_sockets[user.row.uuid])
                .setIo(mocked_user_sockets[user.row.uuid])
                .setRedis(redis_client)
                .handle()
        }
    })

    test('Every player has data', () => {
        expect(
            Object.keys(GameData.player_data)
                .length
        )
            .toBe(users.length)
    })

    test('Every player has the correct game data', async () => {
        const player_names = users.map(user => user.row.name).sort(),
            is_czar_phase = JSON.parse(await redis_client.hGet(
                getGameKey('state', game.row.id),
                'is_czar_phase')
            ),
            current_card = (
                await redis_client.lRange(
                    getGameKey('deck', game.row.id),
                    0,
                    0
                )
            )[0],
            is_started = JSON.parse(await redis_client.hGet(
                getGameKey('state', game.row.id),
                'is_started'
            )),
            cards_in_play = await redis_client.hGetAll(getGameKey('cards_in_play', game.row.id)),
            current_czar = await redis_client.hGet(getGameKey('state', game.row.id), 'current_czar')

        for (const uuid in GameData.player_data) {
            const current_user_model = users.filter(user => user.row.uuid === uuid)?.[0],
                current_user_socket_game_data = GameData.player_data[uuid]

            // Is current czar flag matched redis values
            expect(
                current_user_socket_game_data.is_czar
            )
                .toBe(
                    current_czar === uuid
                )

            // Cards in play should match index length of redis values
            expect(
                current_user_socket_game_data
                    .cards_in_play_count
            )
                .toBe(Object.keys(cards_in_play).length)


            // Own cards in play count matches redis values
            expect(
                current_user_socket_game_data
                    .own_cards_in_play
                    .length
            )
                .toBe((cards_in_play[uuid] || []).length)

            // Is started matches redis value
            expect(
                current_user_socket_game_data
                    .game_started
            )
                .toBe(is_started)


            // Black card matches redis value
            expect(
                current_user_socket_game_data
                    .black_card
            )
                .toBe(current_card)


            // Czar phase flag matches redis value
            expect(current_user_socket_game_data.is_czar_phase)
                .toBe(is_czar_phase)

            // Only the host has the is_host flag set
            expect(current_user_socket_game_data.is_host)
                .toBe(current_user_model.row.id === game.row.host_id)


            //Expect every user to be in the game.players data
            expect(
                GameData.player_data[uuid].scoreboard
                    .map(player => player.name)
                    .sort()
            )
                .toStrictEqual(player_names)

            const user_self = GameData.player_data[uuid]
                .scoreboard
                .filter(player => player.is_self)
                .map(player => player.name)


            //Only one player flagged as self
            expect(user_self.length).toBe(1)

            //Self flag is set on the correct player data
            expect(user_self[0])
                .toBe(
                    current_user_model?.row
                        ?.name
                )
        }
    })

    test('Every player has a unique hand of unique cards', () => {
        let hands = []

        for (const uuid in GameData.player_data) {
            // console.log(game_data.player_data[uuid])
            //Hand has 10 cards
            expect(
                GameData.player_data[uuid]
                    .hand
                    .length
            )
                .toBe(10)

            const unique_cards = GameData.player_data[uuid]
                ?.hand
                ?.filter(
                    (item, pos) =>
                        GameData.player_data[uuid].hand.indexOf(item) === pos
                )

            hands.push(unique_cards)

            //All cards are unique
            expect(unique_cards.length)
                .toBe(
                    GameData.player_data[uuid]
                        .hand
                        .length
                )
        }

        const unique_hands = hands.filter(
            (item, pos) =>
                hands.indexOf(item) === pos
        )

        //All hands are unique (possible that they aren't, but very unlikely!)
        expect(unique_hands.length)
            .toBe(
                users.length
            )
    })

    afterAll(async () => {
        await redis_client.disconnect()
    })
})