const WhereQuery = require('../WhereQuery'),
	RawQuery = require('../RawQuery')

module.exports = () => ({
	where_clauses: [],
	where(column, operator = '=', value = null, condition = 'and', raw) {
		this.where_clauses
			.push(
				new WhereQuery(column, value, operator, condition, raw)
			)

		return this
	},
	whereEquals(column, value, raw = false) {
		return this.where(column, undefined, value, undefined, raw)
	},
	whereNotEquals(column, value = null) {
		return this.where(column, '<>', value)
	},
	orWhereEquals(column, value) {
		return this.where(column, undefined, value, 'or')
	},
	whereGroup(closure) {
		let where_clauses = this.where_clauses

		closure(
			() => {
				where_clauses.push(new WhereQuery())

				return where_clauses[where_clauses.length - 1]
			}
		)

		this.where_clauses = where_clauses

		return this
	},
	whereRaw(sql, bindings = []) {
		this.where_clauses
			.push(new RawQuery(sql, bindings))

		return this
	},
})