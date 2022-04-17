const Query = require('../database/query/Query'),
	WhereQuery = require('../database/query/WhereQuery')

module.exports = class Model extends Query {
	//TODO: build primary key concept
	//TODO: build more relations

	constructor() {
		super()

		this.row = {}
	}

	//TODO: Maybe have each relation extend model or query?, attach etc methods will need to go somewhere
	async belongsTo(table, local_column, foreign_column = 'id') {
		return await (
			(
				typeof table === 'string'
					? (new Model).setTable(table)
					: new table
			)
				.whereEquals(foreign_column, this.row[local_column])
				.first()
		)
	}

	hasMany(table, local_column, foreign_column = 'id') {
		return ((
			typeof table === 'string'
				? (new Model).setTable(table)
				: new table
		)
			.whereEquals(foreign_column, this.row[local_column])
			.first())
	}

	async get() {
		const model_datum = await super.get()

		return model_datum
			? model_datum.map(model_data => (new this.constructor()).fill(model_data))
			: null
	}

	save() {
		this.update(this.row)
	}

	async first() {
		const model_data = await super.first()

		return model_data
			? this.fill(model_data)
			: null
	}

	async find(id) {
		this.where_clauses = [new WhereQuery('id', id)]

		return await this.first()
	}

	fill(data) {
		this.row = data

		return this
	}

	async update(data) {
		Object.keys(data)
			.forEach(column => this.row[column] = data[column])

		await super.update(this.row)
	}

	async create(data) {
		return await this.find(await super.create(data))
	}
}