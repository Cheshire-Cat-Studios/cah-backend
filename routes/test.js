const game_controller = require('../controllers/game_controller')

module.exports = (route) => {

        route()
        .setPath('/test')
        .setMiddleware([])
        .group(route => {

            route()
                .setGet()
                .setPath('/hmm')
                .setMethod(game_controller.index)

        })
}