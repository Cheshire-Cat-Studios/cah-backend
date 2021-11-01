const Rule = require('./Rule'),
    Query = require('../../database/query/Query')

module.exports = class Max extends Rule {
    constructor(max) {
        super();

        this.min = max
        this.message = `:attribute cannot exceed ${this.max} characters`
    }

    handle(){
        return (this.data.length || 0) <= this.max
    }
}