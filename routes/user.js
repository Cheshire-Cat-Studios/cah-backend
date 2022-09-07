const
	{
		Validation,
		Throttle
	} = require('jester').middleware,
	Auth = require('../middleware/Auth'),
	// Throttle = require('../middleware/Throttle'),
	CreateUserValidation = require('../validation/CreateUserValidation'),
	UserController = require('../controllers/UserController')

module.exports = route => {
	route()
		.setMiddleware([
			// new Throttle,
			new Validation(
				new CreateUserValidation
			),
		])
		.post('/', UserController, 'create')

	route()
		.setMiddleware([
			new Auth,
			new Throttle(200, 10),
		])
		.get('verify', UserController, 'verify')
}