const
	ServiceProvider = require('./ServiceProvider'),
	socketIoModule = require('../modules/socket-io'),
	CahSocketsBuilder = require('../../sockets/builders/cah/CahSocketsBuilder')


module.exports = class SocketServiceProvider extends ServiceProvider {
	constructor(app) {
		super(app)
	}

	handle() {
		//TODO:: move this into the sockets builder?
		const io = socketIoModule
			.initialise(this.app.globals.server)
			.applyMiddleware()
			.io

		//Move listeners logic into a module?
		io.on(
			'connection',
			async socket => {
				const cahSocketsBuilder = new CahSocketsBuilder()

				cahSocketsBuilder
					.setIo(io)
					.setSocket(socket)
					.handle()
			}
		)
	}
}