

const
	Validation = require('./Validation/Validation'),
	rules = require('./Validation/rules'),
	app = require('./app'),
	Route = require('./routes/Route'),
	Router = require('./routes/Router'),
	Event = require('./events/Event'),
	redis_client = require('./modules/redis'),
	event_handler = require('./modules/event-handler')
	// Middleware = require('./'),
	Controller = require('./controllers/Controller'),
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
		//TODO: event handler is a class not a module!
		event_handler
	}
}