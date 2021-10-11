module.exports = class Rule {
	constructor() {
		this.data = null
		this.name = ''
		this.message = ''
		this.end_if_passes = false
		this.error_if_false = true
	}

	setData(data) {
		this.data = data

		return this
	}

	handle() {
		return true
	}
}