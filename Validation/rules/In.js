const Rule = require('./Rule')

module.exports = class In extends Rule {
    constructor(array) {
        super();

        this.array = array
        this.message = 'that :attribute is not allowed'
    }

    handle(){
        return this.array.includes(this.data)
    }
}