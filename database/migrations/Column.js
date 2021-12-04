module.exports = class Column {
	constructor() {
		this.name = null
		this.is_nullable = false
		this.type = null
		this.is_primary_key = false
		this.is_unique = false
	}

	setNullable(bool = true){
		this.is_nullable = bool

		return this
	}

	setUnique(bool = true){
		this.is_unique = bool

		return this
	}

	integer(name){
		this.name = name
		this.type = 'INTEGER'

		return this
	}

	boolean(name){
		this.name = name
		this.type = 'TINYINT(1)'

		return this
	}

	string(name, limit = 250){
		this.name = name
		this.type = `VARCHAR(${limit})`

		return this
	}

	setType(type){
		this.type = type

		return this
	}

	setPrimaryKey(bool = true){
		this.is_primary_key = bool

		return this
	}

	parse(){
		return `${this.name} ${this.type} ${this.is_primary_key ? 'PRIMARY KEY' : ''} ${!this.is_primary_key && !this.is_nullable ? 'NOT NULL' : ''} ${!this.is_primary_key && !this.is_unique ? 'NOT NULL' : ''}`
	}
}