const Query = require('../../database/query/Query')

module.exports = class Relationship {
	constructor(table) {
		this.table = table
		this.query = null
	}

	//TODO: built a method to parse relationship into a join clause (and logic the fill the data into the model relationships data)

	belongsTo(table, local_column, foreign_column = 'id') {
		return (
			typeof table === 'string'
				? (new Query).setTable(table)
				: new table
		)
			.whereEquals(foreign_column, this.row[local_column])
			.first()
	}

	hasMany(table, local_column, foreign_column = 'id') {
		return (
			typeof table === 'string'
				? (new Query).setTable(table)
				: new table
		)
			.whereEquals(foreign_column, this.row[local_column])
			.first()
	}

	queryLogic(query){
		return query
	}
}