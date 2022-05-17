const ServiceProvider = require('./ServiceProvider')

//TODO: move the route mapping logic into a module so it can be reused for route() helper and route cli logic
module.exports = class RouteServiceProvider extends ServiceProvider {

	route = new (require('../routes/Route'))

	handle() {
		this.buildRoutes()
		this.parseRoutes()
	}

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

	parseRoutes() {
		this.route
			.routes
			.forEach(this.parseRoute, this)
	}

	parseRoute(route, parent) {
		let self = this

		route.method
			? self.createExpressRoute(route, parent)
			: route.routes.forEach(child_route => {

				const new_parent = {
					path: `${parent.path || ''}/${route.path || ''}`,
					name: `${parent.path || ''}.${route.path || ''}`,
					middleware: [
						...(parent.middleware || []),
						...route.middleware,
					]
				}

				self.parseRoute(child_route, new_parent)
			}, this)
	}

	//TODO: consider sacking off express routes, only using express for routing and sockets, node can do both adequately
	createExpressRoute(route, parent) {

		const url = `${parent.path}/${route.path}`.replace(/\/+/g, '/')
		let route_lifecycle = [
			...(parent.middleware || []),
			...route.middleware,
		]
			.map(name => (req, res, next) => {
				const middleware_closure = middleware[name]

				typeof name === 'string'
					? middleware[middleware_closure].handle(req, res, next)
					: name.handle(req, res, next)
			})

		//TODO: consider wrapping below similar to above to allow for more complex controllers and middleware
		route_lifecycle.push(route.method)

		route.is_get
			? this.app.get(url, route_lifecycle)
			: this.app.post(url, route_lifecycle)
	}
}