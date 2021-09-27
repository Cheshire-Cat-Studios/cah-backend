const sendJsend = require('../helpers/sendJsend'),
    DatabaseService = require('../services/DatabaseService')

module.exports = {

    index(req, res){
        sendJsend(
            res,
            200,
            'success',
            {
                games: (new DatabaseService).selectFrom('games')
            }
        )
    },

    // join(req, res){
        // const user = this.app.globals.users.getUser(req.body.user.id, req.body.user.secret)
        //
        // !(user instanceof User)
        // && res.sendJsend(422, 'error', {'errors': [{field: 'user', msg: 'user is invalid'}]})
        //
        // const game = this.app.globals.games.games[req.body.game.id]
        //
        // if (game instanceof Game) {
        //     !game.config.password || game.config.password === req.body.game.password
        //         ? (
        //             game.addUser(user)
        //                 ? res.sendJsend(200, 'success', {})
        //                 : res.sendJsend(200, 'error', {'errors': [{field: 'game', msg: 'game is full'}]})
        //         )
        //         : res.sendJsend(422, 'error', {'errors': [{field: 'password', msg: 'password is invalid'}]})
        // } else {
        //     res.sendJsend(400, 'error', {'errors': [{field: 'game', msg: 'game is invalid'}]})
        // }
    // },

    // create(req, res) {
    //     const host = this.app.globals.users.getUser(req.body.host, req.body.secret)
    //
    //     if (!host) {
    //         res.sendJsend(422, 'error', {'errors': [{field: 'host', msg: 'host is invalid'}]})
    //     }
    //
    //     const game = this.app.globals.games.addGame(req.body.name, host, req.body.config)
    //
    //     if (game instanceof Game) {
    //         host.assignGame(game)
    //
    //         res.sendJsend(200, 'success', {
    //             game: {
    //                 id: game.id,
    //                 password: game.config.password
    //             }
    //         })
    //     } else {
    //         res.sendJsend(422, 'error', {
    //             errors: [
    //                 {
    //                     field: 'name',
    //                     msg: 'That game name is already in use, please chose another'
    //                 }
    //             ]
    //         })
    //     }
    // }
}