module.exports = () => {
	require('dotenv').config()

	const app = require('express')()

	for (const Provider of require('./config/providers.js')) {
		(async () => {
			await (new Provider(app).handle())
		})()
	}

	return app
}