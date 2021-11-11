const Rule = require('./Rule'),
    Query = require('../../database/query/Query')

module.exports = class Unique extends Rule {
    //TODO: add support for models?
    constructor(table, column = 'id') {
        super();

        this.table = table
        this.column = column
        this.message = ':attribute must be unique'
    }

    handle(){
        return !(new Query).setTable(this.table)
            .whereEquals(this.column, this.data)
            .exists()
    }
}