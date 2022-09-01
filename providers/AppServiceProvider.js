const
	ServiceProvider = require('./ServiceProvider'),
	express = require('express'),
	logger = require('morgan'),
	cors = require('cors'),
	path = require('path'),
	cors_config = require(path.join(process.cwd(), 'config/cors'))

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