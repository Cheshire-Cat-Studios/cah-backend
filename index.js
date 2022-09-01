const
	Validation = require('./Validation/Validation'),
	rules = require('./Validation/rules'),
	app = require('./app'),
	Route = require('./routes/Route'),
	Router = require('./routes/Router'),
	// Middleware = require('./'),
	Controller = require('./controllers/Controller'),
	{
		AppServiceProvider,
		RouteServiceProvider,
		ServiceProvider,
		EventServiceProvider
	} = require('./providers')

module.exports = {
	rules: rules,
	Validation,
	app,
	Route,
	Router,
	ServiceProvider,
	Controller,
	providers: {
		AppServiceProvider,
		RouteServiceProvider,
		EventServiceProvider
	},
}