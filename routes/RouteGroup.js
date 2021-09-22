module.exports = class RouteGroup {
    router = require('express').Router()
    middleware = []
    prefix = '/'

    applyMiddleware(){
        this.middleware
            .forEach(middleware => {
                this.router.use(middleware)
            })

        return this;
    }

    buildRoutes(){
        return this;
    }

    getRouter(){
        return this.router
    }

    handle(){
        return this.applyMiddleware()
            .buildRoutes()
            .getRouter()
    }
}