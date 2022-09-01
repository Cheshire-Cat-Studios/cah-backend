const Middleware = require('./Middleware')

module.exports = class Validation extends Middleware {
	constructor(validation, append_validated_data_to_request = false) {
		super()

		this.validation = validation
		this.append_validated_data_to_request = append_validated_data_to_request
	}

	handle() {
		this.validation
			.setData(this.req.body)
			.validate()

		if (Object.keys(this.validation.errors).length) {
			this.sendJsend(400, 'error', this.validation.errors)

			return
		}

		const validation_rules = Object.keys(this.validation.getRules())

		this.req.validated_data = {}

		Object.keys(this.req.body)
			.forEach(data_key => {
				validation_rules.includes(data_key)
				&& (this.req.validated_data[data_key] = this.req.body[data_key])
			})

		this.next()
	}
}