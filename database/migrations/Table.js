const Column = require('./Column')

module.exports = class Table {
	constructor(table_name = null) {
		this.table_name = table_name
		this.columns = []
	}

	setName(table_name){
		this.table_name = table_name

		return this
	}

	create(closure) {
		let columns = []

		closure(
			() => {
				columns.push(new Column)

				return columns[columns.length - 1]
			}
		)

		this.columns = columns

		return this
	}

	parse(){
		let sql_string = `CREATE TABLE ${this.table_name} ( `

		this.columns.forEach((column, index,array) => {

			sql_string+= column.parse()

			sql_string+= (index === array.length - 1) ? ')' : ', '

		})

		return sql_string
	}
}