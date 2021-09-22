module.exports = app => {
    app.get('/users/:userId/:secret', (req, res) => {
        const user = app.globals.users.getUser(req.params.userId, req.params.secret);

        user instanceof User
            ? res.sendJsend(200, 'success', {
                userId: user.id,
                secret: user.secret,
                gameId: user.game_data.current_game
            })
            : res.sendJsend(400, 'error', {})
    });

    app.post('/users', require('../validations/user/UserCreateValidation')(), validate, function (req, res) {
        const user = app.globals.users.addUser(req.body.name);

        if (user instanceof User) {
            res.sendJsend(
                200,
                'success',
                {
                    userId: user.id,
                    secret: user.secret,
                });
        } else {
            res.sendJsend(422, 'error', {
                errors: [
                    {
                        field: 'player_name',
                        msg: 'That player name is already in use, please chose another'
                    }
                ]
            });
        }
    });
}