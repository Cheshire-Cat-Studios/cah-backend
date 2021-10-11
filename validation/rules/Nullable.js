const Rule = require('./Rule'),
    Query = require('../../database/query/Query')

module.exports = class Nullable extends Rule {
    constructor() {
        super();

        this.end_if_passes = true
        this.error_if_false = false
    }

    handle(){
        return this.data === null || this.data === undefined
    }
}