const path = require('path')

module.exports = () => {
	require('dotenv').config()

	const app = require('express')()

	for (const Provider of require(path.join(process.cwd(), 'config/providers'))) {
		(async () => {
			await (new Provider(app).handle())
		})()
	}

	return app
}