const Rule = require('./Rule')

module.exports = class Max extends Rule {
    constructor(max) {
        super();

        this.max = max
        this.message = `:attribute cannot exceed ${this.max} characters`
    }

    handle(){
        return (this.data.length || 0) <= this.max
    }
}