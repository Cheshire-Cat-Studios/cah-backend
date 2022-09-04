const Command = require('./Command'),
    colour = require('../helpers/colour'),
    QueryBuilder = new (require('../database/query/Query'))

module.exports = class Query extends Command {
    name = 'query'
    description = 'command for quickly viewing table data'
    options_description = 'table'

    async handle() {
        try {
            if (!this.options.table) {
                throw new Error('--table is a required parameter!')
            }

            QueryBuilder.setTable(this.options.table)
                .when(
                    this.options.where,
                    (query, where) => {
                        query.whereRaw(where)
                    }
                )
                .when(
                    this.options.limit,
                    (query, limit) => {
                        query.setLimit(limit)
                    }
                )
                .when(
                    this.options.offset,
                    (query, offset) => {
                        query.setOffset(offset)
                    }
                )
                .when(
                    this.options.order,
                    (query, order) => {
                        query.orderBy(
                            order,
                            !!this.options.asc
                        )
                    }
                )

            console.table(
                this.options.find
                    ? [await QueryBuilder.find(this.options.find)]
                    : await QueryBuilder.get()
            )
        } catch (e) {
            colour.error(e.toString())
            colour.error(e.message)
            colour.error(e.tr)
        }
    }
}