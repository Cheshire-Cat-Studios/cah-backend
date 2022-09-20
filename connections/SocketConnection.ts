import {Server, Socket} from 'socket.io'
import cors from '../config/cors.js'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import {RedisConnection} from '@cheshire-cat-studios/jester'
import AuthenticatedSocket from '../sockets/AuthenticatedSocket.js'

class SocketConnection {
    static io: Server = null

    static initialise(server): typeof SocketConnection {
        !SocketConnection.io
        && (SocketConnection.io = new Server(server, {cors}))

        return SocketConnection
    }

    static applyMiddleware(): typeof SocketConnection {
        SocketConnection.io.use(async (socket: AuthenticatedSocket, next) => {
            const redis_client = await RedisConnection.getClient()

            try {
                const uuid = jwt.verify(
                    // @ts-ignore
                    socket.handshake?.query?.token,
                    process.env.JWT_ACCESS_TOKEN_SECRET
                )
                    .uuid

                //TODO: when game is over etc etc, easily can invalidate the connection by deleting socket.user and disconnecting the socket
                !socket.user
                && (
                    socket.user = (await new User()
                            .whereEquals('uuid', uuid)
                            .first()
                    )
                        .row
                )

                //if user has a game and the game has its state stored in redis, allow the user to connect
                socket.user.current_game
                && await redis_client.exists(`game.${socket.user.current_game}.state`)
                    ? next()
                    : socket.disconnect()
            } catch (e) {
                console.log('socket middleware failed')
                socket.disconnect()
            }
        })

        return SocketConnection
    }
}

export default SocketConnection