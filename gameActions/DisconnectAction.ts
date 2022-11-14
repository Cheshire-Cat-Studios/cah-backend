import GameAction from './GameAction.js'
import {EventHandler} from '@cheshire-cat-studios/jester'


//TODO: abstract into config
const timeout = 2000 //5 seconds

class DisconnectAction extends GameAction {
    async handle(): Promise<void> {
        if (!this.socket?.user?.current_game) {
            return
        }

        await this.redis.set(
            this.getPlayerRedisKey('is_active'),
            'false'
        )

        EventHandler
            .emit(
                'user-left',
                this.socket.id,
                this.socket.user.id,
                this.socket.user.current_game
            )
    }
}

export default DisconnectAction