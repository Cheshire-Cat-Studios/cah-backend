module.exports = class Router {
	route = null
	app = null

	setApp(app){
		this.app = app

		return this
	}

	setRoute(route){
		this.route = route

		return this
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
		const url = `${parent.path || ''}/${route.path}`.replace(/\/+/g, '/')

		let route_lifecycle = [
			...(parent.middleware || []),
			...route.middleware,
		]
			.map(middleware => (req, res, next) => {
				middleware.handle(req, res, next)
			})

		route_lifecycle.push(
			(req,res) => {
				typeof route.method === 'function'
					? route.method(req,res)
					: (new route.method[0](req,res))[route.method[1]]()
			}
		)

		route.is_get
			? this.app.get(url, route_lifecycle)
			: this.app.post(url, route_lifecycle)
	}
}