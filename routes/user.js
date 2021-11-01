const user_controller = require('../controllers/user_controller'),
	Validation = require('../middleware/Validation'),
	Auth = require('../middleware/Auth'),
	CreateUserValidation = require('../validation/CreateUserValidation')

module.exports = route => {
	//TODO: pointless route group below
	route()
		.group(route => {
			route()
				.setMiddleware([
					// new Auth,
					new Validation(
						new CreateUserValidation
					),
				])
				.post('/', user_controller.create)

			route()
				// .setMiddleware([
				// 	new Auth
				// ])
				.get('/:userId/:secret', user_controller.get)
			// .setPath()
			// .setMiddleware([new Auth])
			// .setMethod()

		})
}