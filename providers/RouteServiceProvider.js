const ServiceProvider = require('./ServiceProvider'),
	Router = require('../routes/Router'),
	path = require('path')

module.exports = class RouteServiceProvider extends ServiceProvider {

	route = new (require('../routes/Route'))

	buildRoutes() {
		this.route
			.group(
				require(
					path.join(
						process.cwd(),
						'routes'
					)
				)
			)
	}

	handle() {
		this.buildRoutes();

		(new Router)
			.setApp(this.app)
			.setRoute(this.route)
			.parseRoutes()
	}
}