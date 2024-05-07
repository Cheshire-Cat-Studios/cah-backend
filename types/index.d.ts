// import {Socket} from "socket.io/dist/socket";

declare global  {
    // type GenericObject = { [key: string]: any }

    namespace Express {
        interface Request {
            user_model: GenericObject
        }
    }

    namespace SocketIO{
        interface Socket {
            user: GenericObject
        }
    }
}



export {}

