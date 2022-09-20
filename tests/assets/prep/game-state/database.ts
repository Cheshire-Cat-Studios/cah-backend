import Game from '../../../../models/Game'
import User from '../../../../models/User'
import GameFactory from '../../../../database/factories/GameFactory'
import UserFactory from '../../../../database/factories/UserFactory'

export default async (
    player_count = 3,
    max_score = 10,
    password = '',
    max_players = player_count
) => {
    await (new GameFactory)
        .setCount(1)
        .setRow({
            password,
            max_score,
            max_players
        })
        .store()

    const game = await (new Game)
        .orderBy('id')
        .first()

    await (new UserFactory)
        .setCount(player_count)
        .setRow({
            current_game: game.row.id
        })
        .store()

    const users = await (new User)
        .whereEquals('current_game', game.row.id)
        .get()


    //TODO: use randomise array helper
    await game.update({
        host_id: users[Math.floor(Math.random() * users.length)].row.id
    })

    return {
        game,
        users
    }
}