import User from '../models/User.js'
import createUniqueId from '../helpers/createUniqueId.js'
import jwt from 'jsonwebtoken'
import {Controller} from '@cheshire-cat-studios/jester'

class UserController extends Controller {
    async create(): Promise<void> {
        try {
            const user = await new User()
                .create({
                    // id: null,
                    uuid: createUniqueId('user'),
                    name: this.req.body.name,
                })

            const token = jwt.sign(
                {uuid: user.row.uuid},
                process.env.JWT_ACCESS_TOKEN_SECRET,
                {
                    expiresIn: parseInt(process.env.JWT_ACCESS_TOKEN_LIFE)
                }
            )

            this.sendJsend(
                200,
                'success',
                {token}
            )
        } catch (e) {
            console.log(e)

            this.sendJsend(
                422,
                'error',
                {
                    errors: [
                        {
                            field: 'player_name',
                            msg: 'That player name is already in use, please chose another'
                        }
                    ]
                }
            )
        }
    }

    verify(): void {
        const token = jwt.sign(
            {uuid: this.req.user_model.row.uuid},
            process.env.JWT_ACCESS_TOKEN_SECRET,
            // {
            // 	expiresIn: 10000000000000000
            // expiresIn: parseInt(process.env.JWT_ACCESS_TOKEN_LIFE)
            // }
        )

        this.sendJsend(
            200,
            'success',
            {
                in_game: !!this.req.user_model.row.current_game,
                token
            }
        )
    }
}

export default UserController