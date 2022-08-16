module.exports = () => {
	const {io} = require('../../../server')

	io.on('connection', socket => {
		serverSocket = socket
	})


}