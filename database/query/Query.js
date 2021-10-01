//TODO: convert raw sql references into its own module (maybe have a constant config folder for shit i want abstracted but never changed?)
const applyTraits = require('../../helpers/applyTraits'),
    JoinQuery = require('./JoinQuery'),
    WhereQuery = require('./WhereQuery'),
    DatabaseService = require('../../services/DatabaseService')

module.exports = class Query {
    table_name = 'users'

    constructor() {
        // super()
        this.query = {
            sql: '',
            bindings: [],
        }
        this.joins = []
        this.limit = 0
        this.offset = 0
        this.order_by = ''
        this.order_by_desc = true
        this.selects = ['*']

        applyTraits(
            this,
            [
                require('./traits/can_when'),
                require('./traits/can_where'),
            ]
        )
    }

    setLimit(limit) {
        this.limit = limit

        return this
    }

    setOffset(offset) {
        this.offset = offset

        return this
    }

    orderBy(order_by, order_by_desc = true) {
        this.order_by = order_by
        this.order_by_desc = order_by_desc

        return this
    }

    join(table_name, column, comparator = '=', value, type = 'left') {
        this.joins.push(new JoinQuery(table_name, column, comparator, value, type))

        return this
    }

    joinOn(table_name, closure) {
        let joins = this.joins

        closure(
            () => {
                joins.push(new JoinQuery(table_name))

                return joins[joins.length - 1]
            }
        )

        this.joins = joins

        return this
    }

    select(select) {
        typeof (select) === 'string'
            ? this.selects = [select]
            : this.selects = select

        return this
    }

    addSelect(select) {
        this.selects = [
            ...this.selects,
            ...(
                typeof (select) === 'string'
                    ? [select]
                    : select
            )
        ]

        return this
    }

    handle() {
        let query = {
            sql: `SELECT ${this.selects.join()} FROM ${this.table_name} `,
            bindings: []
        }

        this.joins.length
        && this.joins
            .forEach((join) => {
                const sub_query = join.handle()


                query.sql = query.sql += sub_query.sql
                query.bindings = [
                    ...query.bindings,
                    ...sub_query.bindings,
                ]
            })

        if (this.where_clauses.length) {
            query.sql += ' WHERE '

            this.where_clauses
                .forEach((where, index) => {
                    const sub_query = where.handle(index)

                    query.sql = query.sql += sub_query.sql
                    query.bindings = [
                        ...query.bindings,
                        ...sub_query.bindings,
                    ]
                })
        }

        return query
    }

    handleSelect(){

    }

    update(){

    }

    delete(){

    }

    get() {
        const query = this.handle()

        let test = (new DatabaseService)
            .database
            .prepare(query.sql)
            .all(query.bindings)

        return test
    }
}