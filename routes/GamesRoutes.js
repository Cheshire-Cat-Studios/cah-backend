const
    RouteGroup = require('./RouteGroup'),
    GameController = require('../controllers/GameController')

module.exports = class GamesRoutes extends RouteGroup {
    prefix = '/games'

    buildRoutes() {
        this.router.get('/', (new GameController).index)

        // this.router.post('/join/:gameId', (new GameController).join)
        //
        // this.router.post(
        //     '/games',
        //     require('../validations/game/GameCreateValidation')(),
        //     validate,
        //     game_controller.create
        // )

        return this
    }
}