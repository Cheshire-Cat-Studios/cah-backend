

const
	Validation = require('./Validation/Validation'),
	rules = require('./Validation/rules'),
	app = require('./app'),
	Route = require('./routes/Route'),
	Router = require('./routes/Router'),
	Event = require('./events/Event'),
	EventHandler = require('./events/EventHandler')
	redis_client = require('./modules/redis'),
	// Middleware = require('./'),
	Controller = require('./controllers/Controller'),
	Command = require('./commands/Command'),
	{
		AppServiceProvider,
		RouteServiceProvider,
		ServiceProvider,
		EventServiceProvider
	} = require('./providers'),
	{
		Middleware,
		Validation: ValidationMiddleware,
		Throttle
		// Auth
	} = require('./middleware')

module.exports = {
	app,
	Controller,
	Command,
	EventHandler,
	Event,
	Middleware,
	Route,
	Router,
	ServiceProvider,
	Validation,
	rules: rules,
	providers: {
		AppServiceProvider,
		RouteServiceProvider,
		EventServiceProvider
	},
	middleware: {
		Validation: ValidationMiddleware,
		Throttle
	},
	modules: {
		redis_client,
	}
}