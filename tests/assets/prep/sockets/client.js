const Client = require('socket.io-client')
const {sign} = require('jsonwebtoken')

module.exports = user => {
	const token = sign(
		{uuid: user.row.uuid},
		process.env.JWT_ACCESS_TOKEN_SECRET,
	)

	return new Client(
		`http://localhost:${process.env.PORT}`,
		{
			query: {
				token,
			}
		}
	)
}