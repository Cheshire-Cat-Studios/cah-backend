const
    ServiceProvider = require('./ServiceProvider'),
    express = require('express'),
    logger = require('morgan'),
    cors = require('cors'),
    // createError = require('http-errors'),
    cors_config = require('../config/cors.js')

module.exports = class AppServiceProvider extends ServiceProvider {
    handle() {
        this.app
            .use(logger('dev'))

        this.app
            .use(cors(cors_config))

        this.app
            .use(express.json())

        this.app.globals = {}

        this.app
            .globals
            .server = this.app.listen(
                `${process.env.PORT}`,
                () => {
                    console.log(`Server started on port ${process.env.PORT}`)
                }
            )
    }
}