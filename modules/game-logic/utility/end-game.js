const redis_client = require('../../redis'),
    Game = require('../../../models/Game')

module.exports = async (io, socket, redis_keys) => {
    console.log('GAME ENDED')

    await redis_client.del(redis_keys.game.state)
    await redis_client.del(redis_keys.game.deck)
    await redis_client.del(redis_keys.game.players)
    await redis_client.del(redis_keys.game.cards_in_play)

    const game = await new Game().find(socket.user.current_game)

    game.delete()

    const players_unmapped = await game.players()
        .handle()
        .select('uuid')
        .get()

    const players = players_unmapped
        .map(player => player.row.uuid)

    await game.players()
        .handle()
        .update({
            'current_game': null,
        })

    for (const uuid of players) {
        await redis_client.del(`players.${uuid}.deck`)
        await redis_client.del(`players.${uuid}.hand`)
        await redis_client.del(`players.${uuid}.is_active`)
    }
}