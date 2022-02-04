const mysql = require('mysql'),
	connection_details = {
		// host: 'mysql',
		host: process.env.MYSQL_HOST,
		port: process.env.MYSQL_PORT,
		user: process.env.MYSQL_USER,
		password: process.env.MYSQL_PASSWORD,
		database: process.env.MYSQL_DATABASE,
	},
	{promisify} = require('util')


module.exports = {
	async query(query_string, bindings = []) {
		try {
			const connection = await mysql.createConnection(connection_details)

			let rtn = await new Promise((resolve, reject) => {
				connection.query(
					query_string,
					bindings,
					(error, result) => {
						error
							? reject(error)
							: resolve(result)
					}
				)
			})

			await connection.end()

			return await rtn

		} catch (e) {
			//LOG ERROR AND FIRE EXCEPTION EVENT?
			console.log('MYSQL ERROR')
			console.log(e)
		}
	},

}
