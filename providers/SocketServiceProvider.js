const ServiceProvider = require('./ServiceProvider'),
	{Server} = require('socket.io'),
	cors = require('../config/cors.js')


module.exports = class AppServiceProvider extends ServiceProvider {
	handle() {
		this.app.globals.io = new Server(this.app.globals.server, {cors})


		// this.app.globals.io =
	}
}