const {Rule} = require('jester').rules,
	Query = require('../../database/query/Query')

module.exports = class Unique extends Rule {
	//TODO: add support for models?
	constructor(table, column = 'id') {
		super()

		this.table = table
		this.column = column
		this.message = ':attribute must be unique'
	}

	async handle() {
		return !await (new Query).setTable(this.table)
			.whereEquals(this.column, this.data)
			.count()
	}
}