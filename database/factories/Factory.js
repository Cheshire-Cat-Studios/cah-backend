module.exports = class Factory {
	constructor() {
		this.model = null
		this.faker = require('faker')
		this.count = 1
	}

	setCount(count) {
		this.count = count

		return this
	}

	schema() {
		return {}
	}

	store() {
		this.model
			.insert(
				Array(this.count)
					.fill()
					.map(() => this.schema())
			)
	}
}