const RouteServiceProvider = require('../providers/RouteServiceProvider'),
    AppServiceProvider = require('../providers/AppServiceProvider'),
    SocketServiceProvider = require('../providers/SocketServiceProvider')

module.exports = [
    AppServiceProvider,
    RouteServiceProvider,
    SocketServiceProvider,
]