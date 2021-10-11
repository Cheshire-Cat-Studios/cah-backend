const user_controller = require('../controllers/user_controller'),
	Validation = require('../middleware/Validation'),
	CreateUserValidation = require('../validation/CreateUserValidation')

module.exports = route=> {
	route()
		.group(route => {
			route().post()
				.setPath('/')
				.setMiddleware([
					new Validation(
						new CreateUserValidation
					),
				])
				.setMethod(user_controller.create)

			route().get()
				.setPath('/:userId/:secret')
				.setMethod(user_controller.get)

		})
}