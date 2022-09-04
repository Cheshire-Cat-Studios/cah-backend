const
	Validation = require('./Validation/Validation'),
	rules = require('./Validation/rules'),
	app = require('./app'),
	Route = require('./routes/Route'),
	Router = require('./routes/Router'),
	Event = require('./events/Event'),
	EventHandler = require('./events/EventHandler'),
	Controller = require('./controllers/Controller'),
	RedisConnection = require('./connections/RedisConnection'),
	{
		Command,
		Help,
		Migrate,
		Query
	} = require('./commands'),
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
	RedisConnection,
	Route,
	Router,
	ServiceProvider,
	Validation,
	commands: {
		Help,
		Migrate,
		Query
	},
	middleware: {
		Validation: ValidationMiddleware,
		Throttle
	},
	providers: {
		AppServiceProvider,
		RouteServiceProvider,
		EventServiceProvider
	},
	rules: rules,
}