module.exports = class Factory {
	constructor() {
		this.model = null
		this.faker = require('@faker-js/faker').faker
		this.count = 1
		this.row = {}
	}

	setRow(row){
		this.row = row

		return this
	}

	setCount(count) {
		this.count = count

		return this
	}

	schema() {
		return {}
	}

	async create() {
		return await this.model
			.create({
				...this.schema(),
				...this.row
			})
	}

	async store() {
		return await this.model
			.insert(
				Array(this.count)
					.fill()
					.map(() => ({
						...this.schema(),
						...this.row
					}))
			)
	}
}