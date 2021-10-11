const Rule = require('./Rule'),
    Query = require('../../database/query/Query')

module.exports = class Unique extends Rule {
    constructor(table, column = 'id') {
        super();

        this.table = table
        this.column = column
        this.message = ':attribute is required'
    }

    handle(){
        return !(new Query).setTable(this.table)
            .whereEquals(this.column, this.data)
            .exists()
    }
}