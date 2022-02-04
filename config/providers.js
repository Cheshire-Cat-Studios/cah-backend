const
    RouteServiceProvider = require('../providers/RouteServiceProvider'),
    AppServiceProvider = require('../providers/AppServiceProvider'),
    SocketServiceProvider = require('../providers/SocketServiceProvider'),
    EventServiceProvider = require('../providers/EventServiceProvider')

module.exports = [
    AppServiceProvider,
    RouteServiceProvider,
    SocketServiceProvider,
    EventServiceProvider,
]