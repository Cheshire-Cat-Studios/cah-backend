// console.log(123)


import {RedisConnection, app, CreateQueueEventService} from '@cheshire-cat-studios/jester'
import SocketConnection from './connections/SocketConnection.js'
import EventHandler from './sockets/EventHandler.js'
import getUserRedisKey from './helpers/getRedisKey/user.js'
import AuthenticatedSocket from './sockets/AuthenticatedSocket.js'
// import {CreateQueueEventService} from '../jester/index.js'
import Game from './models/Game.js'

const server = (await app()).listen(
        //TODO: use env service from jester
        `${process.env.PORT}`,
        () => {
            console.log(`Server started on ${process.env.HOST}:${process.env.PORT}`)
        },
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
            'true',
        )

        const game = await new Game().find(socket.user.current_game)

        game
            ? await new CreateQueueEventService(game.row.queue_id)
                .handle(
                    'initialise',
                    {
                        socket_id: socket.id,
                        game_id: socket.user.current_game,
                        user_id: socket.user.id,
                    },
                )
            : socket.disconnect()


        await (new EventHandler)
            .setSocket(socket)
            .setGame(game)
            .handle()
    },
)

export {
    server,
    io,
}