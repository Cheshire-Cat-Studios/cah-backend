import {Socket} from 'socket.io'

class AuthenticatedSocket extends Socket {
    user: GenericObject
}

export default AuthenticatedSocket