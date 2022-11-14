import {
    // ValidationMiddleware,
    // Throttle,
    Route,
    ValidationMiddleware
} from '@cheshire-cat-studios/jester'
import ActionEventController from '../controllers/ActionEventController.js'
import ActionEventValidation from "../validation/ActionEventValidation.js";

export default (route: () => Route): void => {
    route()
        .setMiddleware([
            new ValidationMiddleware(new ActionEventValidation)
            // new Auth,
            // new Throttle(200, 10),
        ])
        .post('action', ActionEventController, 'actionEvent')
}