const game_controller = require('../controllers/game_controller'),
    CreateUserRequest = require('../validation')

module.exports = (route) => {

        route()
        .setPath('/test')
        .group(route => {

            route()
                .setGet()
                .setPath('/hmm')
                .setMiddleware([
                    CreateUserRequest
                ])
                .setMethod(game_controller.index)

        })
}