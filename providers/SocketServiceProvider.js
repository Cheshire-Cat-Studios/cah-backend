const ServiceProvider = require('./ServiceProvider')

module.exports = class AppServiceProvider extends ServiceProvider {
    handle() {
        this.app.globals.io = require('socket.io')(this.app.globals.server)
    }
}