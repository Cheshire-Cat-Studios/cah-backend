import keys from '../../config/redis/keys/player.js'

export default (key: string, uuid: string): string | null =>
    keys[key]
        ?.replace(
            '#',
            uuid
        )