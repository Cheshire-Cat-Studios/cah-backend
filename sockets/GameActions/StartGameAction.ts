import Game from '../../models/Game.js'
import GameAction from "./GameAction.js"

class CahStartGameAction extends GameAction {
    async handle(): Promise<void> {
        const game = await new Game()
            .whereEquals('id', this.socket.user.current_game)
            .first()

        if (
            this.socket.user.id !== game?.row?.host_id
        ) {
            return
        }

        const czar = (
            await game.players()
                .handle()
                .orderBy('RAND()')
                .select('uuid')
                .first()
        )
            .row
            .uuid

        await this.redis.hSet(this.getGameRedisKey('state'), 'current_czar', czar)
        await this.redis.hSet(this.getGameRedisKey('state'), 'is_started', 'true');

        (
            await this.io
                .in('game.' + this.socket.user.current_game)
                .fetchSockets()
        )
            //TODO: fix this typing!
            .forEach((user_socket:any) => {
                user_socket.emit(
                    'game-started',
                    {
                        is_czar: user_socket.user.uuid === czar
                    }
                )
            })
    }
}

export default CahStartGameAction