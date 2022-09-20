import keys from '../../config/redis/keys/game.js'

export default (key: string, id: string): null | string =>
    keys[key]
        ?.replace(
            '#',
            id
        )