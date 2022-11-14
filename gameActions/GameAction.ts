import {Server} from 'socket.io'
import {RedisClientType} from 'redis'
import keys from '../config/redis/keys/index.js'
import AuthenticatedSocket from '../sockets/AuthenticatedSocket.js'

abstract class GameAction {
    socket: AuthenticatedSocket
    redis: RedisClientType
    io: Server
    keys: GenericObject = keys

    setRedis(redis: RedisClientType): this {
        this.redis = redis

        return this
    }

    setSocket(socket: AuthenticatedSocket):this {
        this.socket = socket

        return this
    }

    setIo(io: Server): this {
        this.io = io

        return this
    }

    //TODO: these should really just reference the redis key helper classes for continuities sake
    // (and only having 1 place to change shouldn the need arise!)
    getPlayerRedisKey(key: string, player_uuid = null): string | null {
        return this.keys
            .player
            [key]
            ?.replace('#', player_uuid || this.socket.user.uuid)
    }

    getGameRedisKey(key: string): string | null {
        return this.keys
            .game
            [key]
            ?.replace('#', this.socket.user.current_game)
    }

    abstract handle(...data:any): Promise<void>
}

export default GameAction