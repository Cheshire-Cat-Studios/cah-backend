const Rule = require('./Rule')

module.exports = class Required extends Rule {
    constructor() {
        super();
        this.message = 'this :attribute is required'
    }

    handle(){
        return this.data !== undefined && this.data !== null
    }
}