import keys from '../../config/redis/keys/player.js'

export default (key: string, uuid: string): null | string =>
    keys[key]
        ?.replace(
            '#',
            uuid
        )