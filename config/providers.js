const RouteServiceProvider = require('../providers/RouteServiceProvider'),
    AppServiceProvider = require('../providers/AppServiceProvider'),
    SocketServiceProvider = require('../providers/SocketServiceProvider'),
    // RedisServiceProvider = require('../providers/RedisServiceProvider')
    SQLiteServiceProvider = require('../providers/SQLiteServiceProvider')

module.exports = [
    AppServiceProvider,
    RouteServiceProvider,
    SocketServiceProvider,
    // SQLiteServiceProvider,
    // RedisServiceProvider,
]