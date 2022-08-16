const
    RouteServiceProvider = require('../providers/RouteServiceProvider'),
    AppServiceProvider = require('../providers/AppServiceProvider'),
    EventServiceProvider = require('../providers/EventServiceProvider')

module.exports = [
    AppServiceProvider,
    RouteServiceProvider,
    EventServiceProvider,
]