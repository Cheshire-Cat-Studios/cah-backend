const ServiceProvider = require('./ServiceProvider'),
	EventEmitter = require('../modules/event-handler'),
	events = require('../events')

module.exports = class EventServiceProvider extends ServiceProvider {
	handle() {
		//TODO: maybe have a global listener that has the class passed in lara style?
		events.forEach(event => {
			event = new event

			EventEmitter.on(
				event.event_name,
				(...params) => {

					event.async
						? setImmediate(() => {
							event.handle(...params)
						})
						: event.handle(...params)
				}
			)
		})
	}
}