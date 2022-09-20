import {
    Route,
    Throttle,
    ValidationMiddleware
} from '@cheshire-cat-studios/jester'
import Auth from '../middleware/Auth.js'
import CreateGameValidation from '../validation/CreateGameValidation.js'
import GameController from '../controllers/GameController.js'

export default (route: () => Route): void => {
    route()
        .setMiddleware([
            new Auth,
            new Throttle(100, 60),
        ])
        .get('/', GameController, 'index')


    route()
        .setMiddleware([
            new Auth,
            new Throttle,
        ])
        .post('/join/:game_uuid', GameController, 'join')

    route()
        .setMiddleware([
            new Auth,
            new ValidationMiddleware(
                new CreateGameValidation
            ),
        ])
        .post('/', GameController, 'create')
}