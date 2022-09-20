import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import {RedisConnection, Middleware} from '@cheshire-cat-studios/jester'

class Auth extends Middleware {
    async handle(): Promise<void> {
        const redis_client = await RedisConnection.getClient(),
            token = this.req.headers?.['authorization']?.split(' ')

        //TODO: this logic is shared by this and the socket middleware, create a user token authentications service!
        if (token?.[0] === 'Bearer') {
            try {
                // @ts-ignore
                const uuid = jwt.verify(token[1], process.env.JWT_ACCESS_TOKEN_SECRET)?.uuid,
                    user = await new User()
                        .whereEquals('uuid', uuid)
                        .first()

                if (user) {
                    //todo: theres got to be a better way to do this?
                    this.req.user_model = user

                    this.next()
                    return
                }

            } catch (e) {
                //TODO: am i reading this right? looks like im just allowing expired tokens to work?!?
                // THIS IS A MASSIVE SECURITY FLOOR, CHANGE IT
                if (e.name === 'TokenExpiredError') {
                    const uuid = jwt.verify(
                            token[1],
                            process.env.JWT_ACCESS_TOKEN_SECRET,
                            {ignoreExpiration: true}
                        )
                            // @ts-ignore
                            .uuid,
                        user = await new User()
                            .whereEquals('uuid', uuid)
                            .first(),
                        active = user && JSON.parse(await redis_client.get(`players.${user.row.uuid}.is_active`))

                    if (active) {
                        this.req.user_model = user

                        this.next()
                        return
                    }

                }
            }
        }

        this.sendJsend(403, 'error', {message: 'Unauthorised access'})
    }
}

export default Auth