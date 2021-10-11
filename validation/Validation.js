module.exports = class Validation {
	constructor() {
		this.aliases = {}
		this.messages = {}
		this.data = {}
		this.errors = {}
	}

	getRules() {
		return []
	}

	pushError(index, rule) {
		!this.errors[index]
		&& (this.errors[index] = [])

		const alias = this.aliases[`${index}.${rule.name}`] || this.aliases[index] || index,
			message = this.messages[`${index}.${rule.name}`] || rule.message

		this.errors[index]
			.push(message.replace(':attribute', alias))
	}

	validate() {
		//TODO: add reset errors state
		const rules = this.getRules()

		Object.keys(rules)
			.forEach(index => {
				const data = this.data[index]

				for (const rule of rules[index]) {
					if(rule.setData(data).handle()){
						if(rule.end_if_passes){
							break
						}
					}else{
						rule.error_if_false
						&& this.pushError(index, rule)
					}
				}

			})
	}

	setData(data) {
		this.data = data

		return this
	}
}