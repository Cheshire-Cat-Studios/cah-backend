module.exports = class Route {
	constructor() {
		this.path = ''
		this.name = ''
		this.is_get = true
		this.middleware = []
		this.routes = []
		this.method = null
	}

	setPath(path) {
		this.path = path

		return this
	}

	setName(name) {
		this.name = name

		return this
	}

	setMethod(method) {
		this.method = method
	}

	setMiddleware(middleware) {
		this.middleware = middleware

		return this
	}

	get(path, method) {
		this.is_get = true
		this.setPath(path)
		this.setMethod(method)
	}

	post(path, method) {
		this.is_get = false
		this.setPath(path)
		this.setMethod(method)
	}

	getState() {
		return {
			middleware: this.middleware,
			name: this.name,
			path: this.path,
			verb: this.verb,
		}
	}

	group(closure) {
		let routes = []

		closure(
			() => {
				routes.push(new Route)

				return routes[routes.length - 1]
			}
		)

		this.routes = routes
	}
}