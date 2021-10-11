const Command = require('./Command'),
    colour = require('../helpers/colour'),
    WhereQuery = require('../database/query/WhereQuery'),
    query = new (require('../database/query/Query')),
    createUniqueId = require('../helpers/createUniqueId'),
    faker = require('faker')

module.exports = class Test extends Command {
    handle() {
        colour.comment('Testing testing 123')

        colour.comment('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')


        let a  = query.setTable('users')
            .create({
                id: null,
                uuid: createUniqueId('user'),
                name: faker.name.findName(),
                secret: faker.random.alpha(25),
            })


        console.log(a)
    }
}