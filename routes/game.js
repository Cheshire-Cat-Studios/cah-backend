const game_controller = require('../controllers/game_controller'),
	Throttle = require('../middleware/Throttle'),
	Validation = require('../middleware/Validation'),
	CreateUserValidation = require('../validation/CreateUserValidation');

module.exports = route => {
	route()
		// .setMiddleware([
		// 	// new Throttle,
		// 	// new Validation(
		// 	// 	new CreateUserValidation
		// 	// ),
		// ])
		.setName('')
		.get('/', game_controller.index)


	// route().post('/join/:gameId', game_controller.join)


	// this.router.post(
	//     '/games',
	//     require('../validations/game/GameCreateValidation')(),
	//     validate,
	//     game_controller.create
	// )
}