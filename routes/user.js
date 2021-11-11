const user_controller = require('../controllers/user_controller'),
	Validation = require('../middleware/Validation'),
	Auth = require('../middleware/Auth'),
	Throttle = require('../middleware/Throttle'),
	CreateUserValidation = require('../validation/CreateUserValidation')

module.exports = route => {
	//TODO: pointless route group below
	route()
		.setMiddleware([
			new Throttle,
			new Validation(
				new CreateUserValidation
			),
		])
		.post('/', user_controller.create)

	route()
		.setMiddleware([
			new Auth,
			new Throttle,
		])
		.get('verify',user_controller.verify)

	// route()
	// 	.get('/:userId/:secret', user_controller.get)
}