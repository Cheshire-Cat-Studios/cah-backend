const ServiceProvider = require('./ServiceProvider'),
    // GameRoutes = new (require('../routes/GamesRoutes'))
    // GameRoutes = require('../routes/GamesRoutes')
    // game = require('../routes/game'),
    middleware = require('../middleware')
router = require('express').Router()


module.exports = class RouteServiceProvider extends ServiceProvider {

    route = new (require('../routes/Route'))

    handle() {
        this.buildRoutes()
        // console.log(123)
        // console.log(this.route)
        // console.log(this.route.routes[0])
        this.parseRoutes()
    }

    buildRoutes() {
        this.route.group(route => {
            route()
                .setPath('abc')
                .setName('abc')
                .group(require('../routes/test'))
        })
    }

    parseRoutes() {

        this.route
            .routes
            .forEach(this.parseRoute, this)
    }

    parseRoute(route, parent) {
        let self = this

        route.method
            ? self.createExpressRoute(route, parent)
            : route.routes.forEach(child_route => {

                const new_parent = {
                    path: `${parent.path}/${route.path}`,
                    name: `${parent.path}.${route.path}`,
                    middleware: [
                        ...(parent.middleware || []),
                        ...route.middleware,
                    ]
                }

                self.parseRoute(child_route, new_parent)
            }, this)
    }

    createExpressRoute(route, parent) {
        [
            ...(parent.middleware || []),
            ...route.middleware,
        ].forEach(name => {
            const middleware_closure = middleware[name]

            middleware_closure
            && route.is_get
                ? this.app.get(`${route.path}/${parent.path}`, middleware[middleware_closure])
                : this.app.post(`${route.path}/${parent.path}`, middleware[middleware_closure])
        })

        console.log(`${route.path}/${parent.path}`)

        route.is_get
            ? this.app.get(`${route.path}/${parent.path}`, route.method)
            : this.app.post(`${route.path}/${parent.path}`, route.method)
    }


}