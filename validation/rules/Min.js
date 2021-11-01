const Rule = require('./Rule'),
    Query = require('../../database/query/Query')

module.exports = class Min extends Rule {
    constructor(min) {
        super();

        this.min = min
        this.message = `:attribute must be at least ${this.min} characters long`
    }

    handle(){
        return (this.data.length || 0) >= this.min
    }
}