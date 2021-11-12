const Relationship = require('./Relationship'),
	Query = require('../../database/query/Query')

module.exports = class HasMany extends Relationship {
	constructor(table, local_column = 'id', foreign_column, local_data) {
		super(table)

		this.local_column = local_column
		this.local_data = local_data
		this.foreign_column = foreign_column
	}

	handle() {
		return (
			typeof this.table === 'string'
				? (new Query).setTable(this.table)
				: new this.table
		)
			.whereGroup(where => {
				this.queryLogic(where)
			})
	}

	//Use the same logic for the query and the join (eager and lazy loading)
	queryLogic(query, raw = false) {
		query().whereEquals(
			this.foreign_column,
			raw ? this.local_column : this.local_data,
			raw
		)
	}

}