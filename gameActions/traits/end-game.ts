import {RedisConnection} from '@cheshire-cat-studios/jester'
import Game from '../../models/Game.js'
import getGameRedisKey from '../../helpers/getRedisKey/game.js'
import getPlayerRedisKey from '../../helpers/getRedisKey/user.js'


export default async (game: Game) => {
    const
        redisClient = await RedisConnection.getClient(),
        game_keys = {
            state: getGameRedisKey('state', game.row.id),
            deck: getGameRedisKey('deck', game.row.id),
            players: getGameRedisKey('players', game.row.id),
            cards_in_play: getGameRedisKey('cards_in_play', game.row.id)
        }

    await redisClient.del(game_keys.state)
    await redisClient.del(game_keys.deck)
    await redisClient.del(game_keys.players)
    await redisClient.del(game_keys.cards_in_play)

    await game.delete()

    const players_unmapped = await game.players()
        .handle()
        .select('uuid')
        .get()

    await game.players()
        .handle()
        .update({
            'current_game': null,
        })

    const players = players_unmapped
        .map(player => player.row.uuid)

    for (const uuid of players) {
        await redisClient.del(getPlayerRedisKey('deck', uuid))
        await redisClient.del(getPlayerRedisKey('hand', uuid))
        await redisClient.del(getPlayerRedisKey('is_active', uuid))
    }
}