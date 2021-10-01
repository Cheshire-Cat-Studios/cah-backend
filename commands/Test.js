const Command = require('./Command'),
    colour = require('../helpers/colour'),
    WhereQuery = require('../database/query/WhereQuery'),
    query = new (require('../database/query/Query'))

module.exports = class Test extends Command {
    handle() {
        colour.comment('Testing testing 123')

        colour.comment('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')


        let a  = query
            // .joinOn(
            //     'test',
            //     (query) => {
            //         query().where('a','>','b')
            //             .orWhereEquals('a','b')
            //     }
            // )
            // .join('test_1','aff')
            .setLimit(5)
            .setOffset(5)
            .setTable('users')
            .where('users.id','>', '1')
            .whereGroup(query => {
                query().where('users.uuid','like', 'userktvkoo3xts48fwcv%')
                    .orWhereEquals('users.id', 3)
            })
            .join('games','games.id','=','users.id')

        console.log(a.handle())
        console.log(a.first())
    }
}