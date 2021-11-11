const Middleware = require('./Middleware'),
	sendJsend = require('../helpers/sendJsend')

module.exports = class Validation extends Middleware {
	constructor(validation, append_validated_data_to_request = false) {
		super()

		this.validation = validation
		this.append_validated_data_to_request = append_validated_data_to_request
	}

	handle(req, res, next) {
		this.validation
			.setData(req.body)
			.validate()

		if (Object.keys(this.validation.errors).length) {
			sendJsend(res, 400, 'error', this.validation.errors)

			return
		}

		const validation_rules = Object.keys(this.validation.getRules())

		req.validated_data = {}

		//TODO: theres gotta be a better way to do this?
		Object.keys(req.body)
			.forEach(data_key => {
				validation_rules.includes(data_key)
				&& (req.validated_data[data_key] = req.body[data_key])
			})

		next()

	}
}