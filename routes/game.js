const game_controller = require('../controllers/game_controller'),
	Throttle = require('../middleware/Throttle'),
	Auth = require('../middleware/Auth'),
	Validation = require('../middleware/Validation'),
	CreateGameValidation = require('../validation/CreateGameValidation')

module.exports = route => {
	route()
		.setMiddleware([
			new Auth,
			new Throttle(100, 60),
		])
		.get('/', game_controller.index)


	route()
		.setMiddleware([
			new Auth,
			new Throttle,
		])
		.post('/join/:game_uuid', game_controller.join)

	route()
		.setMiddleware([
			new Auth,
			new Validation(new CreateGameValidation),
		])
		.post('/', game_controller.create)
}