const GameFactory = require('../factories/GameFactory')

module.exports = () => {
    new GameFactory()
        .setCount(3)
        .store()
}