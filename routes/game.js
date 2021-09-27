const RouteGroup = require('./RouteGroup'),
    game_controller = require('../controllers/game_controller')
//TODO: finish conversion to new format
module.exports = (route) => {
   route
        // .setNamePrefix('test')
        .setPath('/test')
        .setMiddleware([])
        .group(router => {

            router.get('/', game_controller.index)

            // this.router.post('/join/:gameId', (new GameController).join)
            //
            // this.router.post(
            //     '/games',
            //     require('../validations/game/GameCreateValidation')(),
            //     validate,
            //     game_controller.create
            // )

            router.get(
                '/test',
                (req, res) => {
                    res.type('json')
                    res.status(200)
                    res.json({
                        status: 200,
                        data: 'IT WORKS BIAAATCH'
                    })
                    res.end()
                }
            )

            (new RouteGroup(app, true))
                .setUrlPrefix('/oops')
                .group((router) => {
                    router.get(
                        '/123',
                        (req, res) => {
                            res.type('json')
                            res.status(200)
                            res.json({
                                status: 200,
                                data: 'does it really?'
                            })
                            res.end()
                        }
                    )

                    return router
                })

            return router
        })
}