const Rule = require('./Rule'),
    Query = require('../../database/query/Query')

module.exports = class Exists extends Rule {
    constructor(table, column = 'id') {
        super();

        this.table = table
        this.column = column
        this.where_group = null
        this.message = ':attribute does not exist'
    }

    where(closure){
        this.where_group = closure

        return this
    }

    handle(){
        return (new Query).setTable(this.table)
            .whereEquals(this.column, this.data)
            .whereGroup(this.where_group)
            .exists()
    }
}