module.exports = class Route {
    constructor() {
        this.path = ''
        this.name = ''
        this.is_get = true
        this.middleware = []
        this.routes = []
        this.method = null
    }

    setPath(path) {
        this.path = path

        return this
    }

    setName(name) {
        this.name = name

        return this
    }

    setGet() {
        this.is_get = true

        return this
    }

    setPost() {
        this.is_get = false

        return this
    }

    setMiddleware(middleware) {
        this.middleware = middleware

        return this
    }
    //
    // post(url, closure) {
    //     this.routes
    //         .push(new this.setVerb('GET').set)
    // }

    getState(){
        return {
            middleware: this.middleware,
            name: this.name,
            path: this.path,
            verb: this.verb,
        }
    }

    setMethod(method){
        console.log(method)
        this.method = method
    }

    group(closure) {
        const self = this

        let routes = []

        closure(
            () => {
                routes.push(new Route)

                return routes[routes.length - 1]
            }
        )

        this.routes = routes
    }
}