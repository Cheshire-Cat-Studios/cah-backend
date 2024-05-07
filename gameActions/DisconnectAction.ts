import GameAction from './GameAction.js'


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


        await new Promise(
            resolve => setTimeout(resolve, timeout)
        )

        const is_active = await this.redis.get(this.getPlayerRedisKey('is_active'))

        if (is_active && JSON.parse(is_active)) {
            return
        }

        // await pushToQueue(
        //     socket_id,
        //     game_id,
        //     user_id,
        //     'leave'
        // )
    }
}

export default DisconnectAction