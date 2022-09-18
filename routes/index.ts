import {Route} from '@cheshire-cat-studios/jester'
import gameRoutes from './game.js'
import userRoutes from './user.js'

export default (route: () => Route): void => {
    route()
        .setPath('users')
        .setName('users')
        .group(userRoutes)

    route()
        .setPath('games')
        .setName('games')
        .group(gameRoutes)
}