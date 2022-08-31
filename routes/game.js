const
	Throttle = require('../middleware/Throttle'),
	Auth = require('../middleware/Auth'),
	Validation = require('../middleware/Validation'),
	CreateGameValidation = require('../validation/CreateGameValidation'),
	GameController = require('../controllers/GameController')

module.exports = route => {
	route()
		.setMiddleware([
			new Auth,
			new Throttle(100, 60),
		])
		.get('/', [GameController, 'index'])


	route()
		.setMiddleware([
			new Auth,
			new Throttle,
		])
		.post('/join/:game_uuid', [GameController, 'join'])

	route()
		.setMiddleware([
			new Auth,
			new Validation(new CreateGameValidation),
		])
		.post('/', [GameController, 'create'])
}