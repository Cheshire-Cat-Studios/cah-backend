import {
    Model,
    BelongsTo,
    HasMany
} from '@cheshire-cat-studios/jester'
import User from './User.js'
import gameKeys from '../config/redis/keys/game.js'

class Game extends Model {
    table_name = 'games'

    host(): BelongsTo {
        return new BelongsTo(User, 'host_id', 'id', this.row.host_id)
    }

    public players(): HasMany {
        return new HasMany(User, 'id', 'current_game', this.row.id)
    }

    public getGameRedisKey(key: string): string | null {
        return gameKeys
            [key]
            ?.replace('#', this.row.id)
    }


    getState() {
        //TODO: built logic to get all players game meta data and cards in play etc

    }
}

export default Game