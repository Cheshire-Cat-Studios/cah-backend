const ServiceProvider = require('./ServiceProvider'),
    // GameRoutes = new (require('../routes/GamesRoutes'))
    GameRoutes = require('../routes/GamesRoutes')


module.exports = class RouteServiceProvider extends ServiceProvider {
    handle() {
        // this.app.set('etag', false)
        //
        // this.app.disable('view cache');
        //
        // this.app.use((req, res, next) => {
        //     res.set('Cache-Control', 'no-store')
        //     next()
        // })

        let test = new GameRoutes

        this.app
            .use(
                test.prefix,
                test.handle()
            )
        // console.log('RouteServiceProvider not implemented')
    }
}