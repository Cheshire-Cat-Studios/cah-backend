const
	app = require('jester').app(),
	socketIoModule = require('./modules/socket-io'),
	EventHandler = require('./sockets/EventHandler'),
	pushToQueue = require('./queue/push-to-queue'),
	// CahSocketsBuilder = require('./sockets/builders/cah/CahSocketsBuilder'),
	server = app.listen(
		`${process.env.PORT}`,
		() => {
			// console.log(`Server started on ${process.env.HOST}:${process.env.PORT}`)
		}
	),
	io = socketIoModule
		.initialise(server)
		.applyMiddleware()
		.io


//TODO: abstract the below into a sockets service provider, add a reference to the new provider here or create server config
io.on(
	'connection',
	async socket => {
		await pushToQueue(
			socket.id,
			socket.user.current_game,
			'initialise'
		);

		await (new EventHandler)
			.setSocket(socket)
			.handle()
	}
)

module.exports = {
	server,
	io,
}