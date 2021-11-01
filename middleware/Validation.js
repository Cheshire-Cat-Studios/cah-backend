const Middleware = require('./Middleware'),
	sendJsend = require('../helpers/sendJsend')

module.exports = class Validation extends Middleware {
	constructor(validation) {
		super()

		this.validation = validation
	}

	handle(req, res, next) {
		this.validation
			.setData(req.body)
			.validate()

		Object.keys(this.validation.errors).length
			? sendJsend(res, 400, 'error', this.validation.errors)
			: next()
	}
}