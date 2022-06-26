const
    PrototypeServiceProvider = require('../providers/PrototypeServiceProvider'),
    RouteServiceProvider = require('../providers/RouteServiceProvider'),
    AppServiceProvider = require('../providers/AppServiceProvider'),
    SocketServiceProvider = require('../providers/SocketServiceProvider'),
    EventServiceProvider = require('../providers/EventServiceProvider')

module.exports = [
    PrototypeServiceProvider,
    AppServiceProvider,
    RouteServiceProvider,
    SocketServiceProvider,
    EventServiceProvider,
]