const {Server} = require('socket.io'),
	cors = require('../config/cors.js'),
	{verify} = require('jsonwebtoken'),
	User = require('../models/User'),
	{redis_client} = require('jester').modules

module.exports = {
	io: null,
	initialise(server) {
		!this.io
		&& (this.io = new Server(server, {cors}))

		return this
	},
	applyMiddleware() {
		this.io.use(async (socket, next) => {
			try {
				const uuid = verify(
					socket.handshake?.query?.token,
					process.env.JWT_ACCESS_TOKEN_SECRET
				)
					.uuid

				//TODO: when game is over etc etc, easily can invalidate the connection by deleting socket.user and disconnecting the socket
				!socket.user
				&& (
					socket.user =  (await new User()
							.whereEquals('uuid', uuid)
							.first()
					)
						.row
				)

				//if user has a game and the game has its state stored in redis, allow the user to connect
				socket.user.current_game
				&& await redis_client.exists(`game.${socket.user.current_game}.state`)
					? next()
					: socket.disconnect()
			} catch (e) {
				console.log('socket middleware failed')
				socket.disconnect()
			}
		})

		return this
	},
}