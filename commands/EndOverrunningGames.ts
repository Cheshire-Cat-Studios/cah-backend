import Command from './Command.js'
import Game from '../models/Game.js'
import endGame from '../gameActions/traits/endGame.js'
import SocketConnection from '../connections/SocketConnection.js'

export default class EndOverrunningGames extends Command {
    async handle() {
        const games = await new Game()
            // .where('game_ends_at', null, 'is not')
            // .where('game_ends_at', 'now()', '<', 'and', true)
            .get()

        for (const game of games) {
            const winning_player_data = {
                score: 0,
                name: '1231'
            }


            console.log(
                SocketConnection.io
            )

            // await endGame(game, winning_player_data)
        }
    }
}