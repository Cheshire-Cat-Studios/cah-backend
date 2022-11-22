import {
    Route,
    ValidationMiddleware,
    QueueRunnerActionAuth
} from '@cheshire-cat-studios/jester'
import ActionEventController from '../controllers/ActionEventController.js'
import ActionEventValidation from "../validation/ActionEventValidation.js";

export default (route: () => Route): void => {
    route()
        .setMiddleware([
            new QueueRunnerActionAuth,
            new ValidationMiddleware(new ActionEventValidation)
        ])
        .post('action', ActionEventController, 'actionEvent')
}