module.exports = class Event {
	constructor(event_name, async = false) {
		this.event_name = event_name
		this.async = async
	}

	handle(){

	}
}