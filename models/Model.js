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
	belongsTo(table, local_column, foreign_column = 'id') {
		return (
			typeof table === 'string'
				? (new Model).setTable(table)
				: new table
		)
			.whereEquals(foreign_column, this.row[local_column])
			.first()
	}

	hasMany() {

	}

	get() {
		const model_datum = super.get()

		return model_datum
			? model_datum.map(model_data => (new this.constructor()).fill(model_data))
			: null
	}

	save() {
		this.update(this.row)
	}

	first() {
		const model_data = super.first()

		return model_data
			? this.fill(model_data)
			: null
	}

	find(id) {
		this.where_clauses = [new WhereQuery('id', id)]

		return this.first()
	}

	fill(data) {
		this.row = data;

		return this
	}

	update(data) {
		Object.keys(data)
			.forEach(column => this.row[column] = data[column])

		super.update(this.row)
	}

	create(data){
		return this.find(super.create(data))
	}
}