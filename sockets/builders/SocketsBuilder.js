module.exports = class SocketBuilder {
	mappings = {}
	io = null
	socket = null

	setIo(io) {
		this.io = io

		return this
	}

	setSocket(socket) {
		this.socket = socket

		return this
	}

	handle(){

	}
}