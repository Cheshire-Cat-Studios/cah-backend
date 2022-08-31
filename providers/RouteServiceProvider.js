const ServiceProvider = require('./ServiceProvider'),
	Router = require('../routes/Router')

//TODO: move the route mapping logic into a module so it can be reused for route() helper and route cli logic
module.exports = class RouteServiceProvider extends ServiceProvider {

	route = new (require('../routes/Route'))

	buildRoutes() {
		this.route
			.group(route => {
				route()
					.setPath('users')
					.setName('users')
					.group(require('../routes/user'))

				route()
					.setPath('games')
					.setName('games')
					.group(require('../routes/game'))
			})
	}

	handle() {
		this.buildRoutes();

		(new Router)
			.setApp(this.app)
			.setRoute(this.route)
			.parseRoutes()
	}
}