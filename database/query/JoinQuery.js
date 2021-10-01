//TODO: convert raw sql references into its own module (maybe have a constant config folder for shit i want abstracted but never changed?)
const applyTraits = require('../../helpers/applyTraits')

module.exports = class JoinQuery {
    constructor(table_name, column, comparator = '=', value, type = 'left') {
        this.table_name = table_name
        this.column = column
        this.comparator = comparator
        this.value = value
        this.type = type

        applyTraits(
            this,
            [
                require('./traits/can_when'),
                require('./traits/can_where'),
            ]
        )
    }

    handle() {
        let query = {
            sql: `${this.type} JOIN ${this.table_name} ON `,
            bindings: []
        }

        if (this.where_clauses.length) {
            this.where_clauses
                .forEach((where, index) => {
                    const sub_query = where.handle(index)

                    query.sql = query.sql += sub_query.sql
                    query.bindings = [
                        ...query.bindings,
                        ...sub_query.bindings,
                    ]
                })
        }else{
            console.log(`${this.column} ${this.comparator} ${this.value}`)
            query.sql+=`${this.column} ${this.comparator} ${this.value}`
        }

        return query
    }

    on
}