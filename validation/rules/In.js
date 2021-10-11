const Rule = require('./Rule')

module.exports = class Max extends Rule {
    constructor(array) {
        super();

        this.array = array
        this.message = 'that :attribute is not allowed'
    }

    handle(){
        return this.array.includes(this.data)
    }
}