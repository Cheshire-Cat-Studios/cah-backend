const
    {
        RouteServiceProvider,
        AppServiceProvider,
        EventServiceProvider
    } = require('jester').providers

module.exports = [
    AppServiceProvider,
    RouteServiceProvider,
    EventServiceProvider,
]