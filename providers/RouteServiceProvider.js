const ServiceProvider = require('./ServiceProvider'),
	// game = require('../routes/game'),
	middleware = require('../middleware')


module.exports = class RouteServiceProvider extends ServiceProvider {

	route = new (require('../routes/Route'))

	handle() {
		this.buildRoutes()
		this.parseRoutes()
	}

	buildRoutes() {
		this.route
			.group(route => {
				// route()
				// 	.setPath('users')
				// 	.setName('users')
				// 	.group(require('../routes/user'))

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

	//TODO: consider fucking off express routes, only using express for routing and sockets, node can do both adequately
	createExpressRoute(route, parent) {
		[
			...(parent.middleware || []),
			...route.middleware,
		].forEach(name => {
			const middleware_closure = middleware[name]

			route.is_get
				? this.app.get(`${parent.path}/${route.path}`.replace(/\/+/g, '/'), (req, res, next) => {
					typeof name === 'string'
						? middleware[middleware_closure].handle(req, res, next)
						: name.handle(req, res, next)
				})
				: this.app.post(`${parent.path}/${route.path}`.replace(/\/+/g, '/'), (req, res, next) => {
					typeof name === 'string'
						? middleware[middleware_closure].handle(req, res, next)
						: name.handle(req, res, next)
				})
		})

		//TODO: consider wrapping below similar to above to allow for more complex controllers and middleware
		route.is_get
			? this.app.get(`${parent.path}/${route.path}`.replace(/\/+/g, '/'), route.method)
			: this.app.post(`${parent.path}/${route.path}`.replace(/\/+/g, '/'), route.method)
	}
}