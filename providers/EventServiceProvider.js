const
	eventHandler = require('../modules/event-handler'),
	path = require('path')

module.exports = class EventServiceProvider {
	handle() {
		for (const event_class of require(path.join(process.cwd(), 'config/events'))) {
			const event = new event_class

			eventHandler.on(
				event.event_name,
				(...params) => {
					event.async
						? setImmediate(() => {
							event.handle(...params)
						})
						: event.handle(...params)
				}
			)
		}
	}
}