import {RedisConnection, app} from '@cheshire-cat-studios/jester'
import SocketConnection from './connections/SocketConnection.js'
import EventHandler from './sockets/EventHandler.js'
import getUserRedisKey from './helpers/getRedisKey/user.js'
import pushToQueue from './queue/push-to-queue.js'
import AuthenticatedSocket from "./sockets/AuthenticatedSocket.js";

const server = (await app()).listen(
        `${process.env.PORT}`,
        () => {
            // console.log(`Server started on ${process.env.HOST}:${process.env.PORT}`)
        }
    ),
    io = SocketConnection
        .initialise(server)
        .applyMiddleware()
        .io


//TODO: abstract the below into a sockets service provider, add a reference to the new provider here or create server config
io.on(
    'connection',
    async (socket: AuthenticatedSocket) => {
        await (await RedisConnection.getClient()).set(
            getUserRedisKey('is_active', socket.user.uuid),
            'true'
        )

        await pushToQueue(
            socket.id,
            socket.user.current_game,
            socket.user.id,
            'initialise'
        );

        await (new EventHandler)
            .setSocket(socket)
            .handle()
    }
)

export {
    server,
    io,
}