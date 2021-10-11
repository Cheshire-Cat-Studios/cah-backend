const Middleware = require('./Middleware'),
	sendJsend = require('../helpers/sendJsend')

module.exports = class Example extends Middleware {
	constructor(validation) {
		super()

		this.validation =  validation
	}

	handle(req, res, next) {
		const errors = this.validation
			.setData(req.body)
			.validate()

		errors
			? sendJsend(res, 400, 'error', errors)
			: next()
	}
}