const Command = require('./Command'),
    migrations = require('../database/migrations'),
    // fs = require('fs'),
    colour = require('../helpers/colour'),
    redis = require('../modules/redis')


module.exports = class Redis extends Command {
    name = 'redis'
    description = 'run commands against redis'

    async handle() {
        await redis.flushAll()
    }
}