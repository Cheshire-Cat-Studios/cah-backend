const Middleware = require('./Middleware')

module.exports = class Example extends Middleware {
	handle(req, res, next) {
		console.log('Request at: ', Date.now())

		next()
	}
}