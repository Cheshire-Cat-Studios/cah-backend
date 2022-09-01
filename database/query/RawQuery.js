//TODO: convert raw sql references into its own module (maybe have a constant config folder for shit i want abstracted but will never change?)
const applyTraits = require('../../helpers/applyTraits')

module.exports = class RawQuery {
    //TODO: switch condition to is_and = true
    constructor(sql = '', bindings = [], is_and = true) {
        this.is_and = is_and
        this.query = {
            sql,
            bindings
        }
    }

    handle(index) {
        this.query.sql = `${index ? (this.is_and ? ' AND ' : ' OR ') : ''} ${this.query.sql}`

        return this.query
    }
}