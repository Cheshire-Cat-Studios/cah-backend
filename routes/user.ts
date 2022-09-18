import {
    ValidationMiddleware,
    Throttle,
    Route
} from '@cheshire-cat-studios/jester'
import Auth from '../middleware/Auth.js'
import CreateUserValidation from '../validation/CreateUserValidation.js'
import UserController from '../controllers/UserController.js'

export default (route: () => Route): void => {
    route()
        .setMiddleware([
            // new Throttle,
            new ValidationMiddleware(
                new CreateUserValidation
            ),
        ])
        .post('/', UserController, 'create')

    route()
        .setMiddleware([
            new Auth,
            new Throttle(200, 10),
        ])
        .get('verify', UserController, 'verify')
}