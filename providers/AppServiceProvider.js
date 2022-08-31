const
	ServiceProvider = require('./ServiceProvider'),
	express = require('express'),
	logger = require('morgan'),
	cors = require('cors'),
	cors_config = require('../config/cors.js')

module.exports = class AppServiceProvider extends ServiceProvider {
	handle() {
		// this.app
		// 	.use(logger('dev'))

		this.app
			.use(cors(cors_config))

		this.app
			.use(express.json())
	}
}