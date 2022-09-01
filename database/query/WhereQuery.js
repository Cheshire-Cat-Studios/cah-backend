//TODO: convert raw sql references into its own module (maybe have a constant config folder for shit i want abstracted but will never change?)
const applyTraits = require('../../helpers/applyTraits')

module.exports = class WhereQuery {
	//TODO: switch condition to is_and = true
	constructor(column, value = null, operator = '=', condition = 'and', raw = false) {
		this.column = column
		this.value = value
		this.operator = operator
		this.condition = condition
		this.raw = raw

		applyTraits(
			this,
			[
				require('./traits/can_when'),
				require('./traits/can_where'),
			]
		)
	}

	handle(index) {
		let query = {
			sql: '',
			bindings: []
		}

		index
		&& (query.sql += ` ${this.condition} `)

		if (!this.where_clauses.length) {
			query.sql += `${this.column} ${this.operator} ${this.raw ? this.value : '?'} `

			!this.raw
			&& query.bindings.push(this.value)
		} else {
			query.sql += ` ( `
			//todo, abstract below into handleSelects() method
			this.where_clauses
				.forEach((where, index) => {
					const sub_query = where.handle(index)

					query.sql = query.sql += sub_query.sql
					query.bindings = [
						...query.bindings,
						...sub_query.bindings,
					]
				})

			query.sql += `) `
		}

		return query
	}
}