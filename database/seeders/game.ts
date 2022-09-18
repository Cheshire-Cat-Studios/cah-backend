import GameFactory from '../factories/GameFactory.js'

export default async () => {
   await new GameFactory()
        .setCount(3)
        .store()
}