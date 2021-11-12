//TODO: convert raw sql references into its own module (maybe have a constant config folder for shit i want abstracted but never changed?)
const applyTraits = require('../../helpers/applyTraits'),
	JoinQuery = require('./JoinQuery'),
	WhereQuery = require('./WhereQuery'),
	DatabaseService = require('../../services/DatabaseService')

module.exports = class Query {
	constructor() {
		// super()
		this.query = {
			sql: '',
			bindings: [],
		}
		this.joins = []
		this.limit = 0
		this.offset = 0
		this.order_by = ''
		this.order_by_desc = true
		this.selects = ['*']
		this.table_name = null

		applyTraits(
			this,
			[
				require('./traits/can_when'),
				require('./traits/can_where'),
			]
		)
	}

	setTable(table_name) {
		this.table_name = table_name

		return this
	}

	setLimit(limit) {
		this.limit = limit

		return this
	}

	setOffset(offset) {
		this.offset = offset

		return this
	}

	orderBy(order_by, order_by_desc = true) {
		this.order_by = order_by
		this.order_by_desc = order_by_desc

		return this
	}

	join(table_name, column, comparator = '=', value, type = 'left') {
		this.joins.push(new JoinQuery(table_name, column, comparator, value, type))

		return this
	}

	joinOn(table_name, closure) {
		let joins = this.joins

		closure(
			() => {
				joins.push(new JoinQuery(table_name))

				return joins[joins.length - 1]
			}
		)

		this.joins = joins

		return this
	}

	select(select) {
		this.selects = (
			typeof (select) === 'string'
				? [select]
				: select
		)

		return this
	}

	addSelect(select) {
		this.selects = [
			...this.selects,
			...(
				typeof (select) === 'string'
					? [select]
					: select
			)
		]

		return this
	}

	handleSelect() {
		this.query = {
			sql: `SELECT ${this.selects.join()} FROM ${this.table_name} `,
			bindings: []
		}

		this.joins.length
		&& this.joins
			.forEach((join) => {
				const sub_query = join.handle()


				this.query.sql = this.query.sql += sub_query.sql
				this.query.bindings = [
					...this.query.bindings,
					...sub_query.bindings,
				]
			})

		this.handleWheres()

		if (this.limit) {
			this.query.sql += ` LIMIT ${this.limit} `
			this.offset
			&& (this.query.sql += ` OFFSET ${this.offset}`)
		}
	}

	handleWheres() {
		if (this.where_clauses.length) {
			this.query.sql += ' WHERE '

			this.where_clauses
				.forEach((where, index) => {
					const sub_query = where.handle(index)

					this.query.sql = this.query.sql += sub_query.sql
					this.query.bindings = [
						...this.query.bindings,
						...sub_query.bindings,
					]
				})
		}
	}

	update(data) {
		const data_keys = Object.keys(data)

		this.query = {
			sql: `UPDATE ${this.table_name} SET `,
			bindings: []
		}

		data_keys.forEach((column, index) => {
			this.query.sql += `${column} = ? ${index === (data_keys.length - 1) ? '' : ','} `
			this.query.bindings.push(data[column])
		})

		this.handleWheres();

		(new DatabaseService)
			.database
			.prepare(this.query.sql)
			.run(this.query.bindings)
	}

	delete() {
		this.query = {
			sql: `DELETE FROM ${this.table_name} `,
			bindings: []
		}

		this.handleWheres();

		(new DatabaseService)
			.database
			.prepare(this.query.sql)
			.run(this.query.bindings)

	}

	get() {
		this.handleSelect()

		return (new DatabaseService)
			.database
			.prepare(this.query.sql)
			.all(this.query.bindings)
	}

	count(count_fields = '*') {
		const count_column = `COUNT (${count_fields})`

		this.selects = [count_column]

		this.handleSelect()

		const data = (new DatabaseService)
			.database
			.prepare(this.query.sql)
			.get(this.query.bindings)

		return data[count_column]
	}

	first() {
		this.handleSelect()

		const data = (new DatabaseService)
			.database
			.prepare(this.query.sql)
			.get(this.query.bindings)

		return data
	}

	exists() {
		//TODO: build db raw functionality so this method can select a raw value to save time/memory
		this.select('id')

		this.handleSelect()

		return !!(new DatabaseService)
			.database
			.prepare(this.query.sql)
			.get(this.query.bindings)
	}

	find(id) {
		this.where_clauses = [new WhereQuery('id', id)]

		return this.first()
	}

	handleInsert(columns) {
		this.query = {
			sql: `INSERT INTO ${this.table_name} (`,
			bindings: []
		}

		columns.forEach((column, index, array) => {
			this.query.sql += `${column}${Object.is(array.length - 1, index) ? ')' : ', '}`
		})

	}

	handleInsertValues(data) {
		this.query.sql += ' VALUES '

		data.forEach((row, index, array) => {
			this.query.sql += '( '

			Object.keys(row)
				.forEach((column, index, array) => {
					this.query.sql += `? ${Object.is(array.length - 1, index) ? ')' : ', '}`
					this.query.bindings.push(row[column])
				})

			this.query.sql += Object.is(array.length - 1, index) ? '' : ', '
		})
	}

	insert(data) {
		this.handleInsert(Object.keys(data[0]))
		this.handleInsertValues(data)

		return (new DatabaseService)
			.database
			.prepare(this.query.sql)
			.run(
				this.query.bindings
			)
	}

	create(data) {
		return this.insert([data]).lastInsertRowid
	}
}