const Command = require('./Command'),
    colour = require('../helpers/colour'),
    QueryBuilder = new (require('../database/query/Query'))

module.exports = class Query extends Command {
    description = 'command for quickly '

    handle() {
        try {
            if (!this.options.table) {
                throw new Error('--table is a required parameter!')
            }


            QueryBuilder.setTable(this.options.table)
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
                    ? [QueryBuilder.find(this.options.find)]
                    : QueryBuilder.get()
            )

        } catch (e) {
            colour.error(e.toString())
        }
    }
}