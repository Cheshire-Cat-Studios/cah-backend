const createUniqueId = require('../../helpers/createUniqueId')
faker = require('faker')

module.exports = () => ({
    id: null,
    uuid: createUniqueId('user'),
    name: faker.name.findName(),
    secret: faker.random.alpha(25),
})