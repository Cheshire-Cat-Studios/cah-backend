const ServiceProvider = require('./ServiceProvider')
const redis = require('redis')

module.exports = class RedisServiceProvider extends ServiceProvider {
    handle() {
        this.app.globals.client = redis.createClient({
            host: process.env.REDIS_HOSTNAME,
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD
        })

        console.log(redis)

        this.app
            .globals
            .client
            .on('error', err => {
                console.log('REDIS ERROR : ' + err)
            })
    }
}