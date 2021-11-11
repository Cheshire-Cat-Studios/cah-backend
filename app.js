require('dotenv').config()

const app = require('express')()

require('./config/providers.js').forEach(provider => {
	new provider(app).handle()
})