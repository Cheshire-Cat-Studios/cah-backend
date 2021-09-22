const ServiceProvider = require('./ServiceProvider')
const UserList = require('/models/users/UserList')
const GameList = require('/models/games/GamesList')

module.exports = class GameServiceProvider extends ServiceProvider {
    handle() {
        this.app.globals = {
            users: new UserList(),
            games: new GameList(this.app.globals.io)
        }
    }
}