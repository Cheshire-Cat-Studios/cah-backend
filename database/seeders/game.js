const GameFactory = require('../factories/GameFactory')

module.exports = async () => {
   await new GameFactory()
        .setCount(3)
        .store()
}