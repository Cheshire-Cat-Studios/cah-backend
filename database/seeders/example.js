const Factory = require('../factories/Factory')

module.exports = async () => {
    await new Factory()
        .setCount(3)
        .store()
}