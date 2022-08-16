const
    ServiceProvider = require('./ServiceProvider'),
    express = require('express'),
    logger = require('morgan'),
    cors = require('cors'),
    // createError = require('http-errors'),
    cors_config = require('../config/cors.js')

//TEMP DOCKER TESTING
const sendJsend = require('../helpers/sendJsend'),
    redis_client = require('../modules/redis')


    module.exports = class AppServiceProvider extends ServiceProvider {
    handle() {
        this.app
            .use(logger('dev'))

        this.app
            .use(cors(cors_config))

        this.app
            .use(express.json())

        // this.app
        //     .globals
        //     .server = this.app.listen(
        //         `${process.env.PORT}`,
        //         () => {
        //             console.log(`Server started on ${process.env.HOST || '127.0.0.1'}:${process.env.PORT}`)
        //         }
        //     )
    }
}