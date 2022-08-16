const eventHandler = require("../modules/event-handler");
	events = require('../events')

module.exports = class EventServiceProvider {
	handle() {
		for (const event_class of events) {
			const event = new event_class;

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