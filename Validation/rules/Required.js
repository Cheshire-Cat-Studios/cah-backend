const Rule = require('./Rule')

module.exports = class Required extends Rule {
    constructor() {
        super();
        this.message = 'this :attribute is required'
        this.end_if_fails = true
    }

    handle(){
        return this.data !== undefined && this.data !== null
    }
}