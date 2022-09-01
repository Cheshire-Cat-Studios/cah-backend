const
	ServiceProvider = require('./ServiceProvider'),
	express = require('express'),
	logger = require('morgan'),
	cors = require('cors'),
	path = require('path')

module.exports = class AppServiceProvider extends ServiceProvider {
	handle() {
		// this.app
		// 	.use(logger('dev'))

		this.app
			.use(
				cors(
					require(
						path.join(process.cwd(), 'config/cors')
					)
				)
			)

		this.app
			.use(express.json())
	}
}