import createUniqueId from '../helpers/createUniqueId.js'
import Game from '../models/Game.js'
import shuffle from 'lodash.shuffle'
import game_deck from '../config/decks/blackCards.js'
import {
    Controller,
    // EventHandler,
    RedisConnection,
    CreateQueueService
    // CreateQueueEventService
} from '@cheshire-cat-studios/jester'

class GameController extends Controller {
    async index(): Promise<void> {
        //TODO: add filter logic here, should be a doddle with the orm

        this.sendJsend(
            200,
            'success',
            {
                games: ((await new Game().get()) || [])
                    .map(game => ({
                        uuid: game.row.uuid,
                        name: game.row.name,
                        game_time_limit_mins: game.row.game_time_limit_mins,
                        round_time_limit_mins: game.row.round_time_limit_mins,
                        max_players: game.row.max_players,
                        max_score: game.row.max_score,
                        private: !!game.row.password,
                    }))
            }
        )
    }

    async join(): Promise<void> {
        let game = null

        //TODO: create validation/middleware for the below logic
        if (this.req.user_model.current_game) {
            this.sendJsend(
                400,
                'error',
                {}
            )

            return
        }

        this.req.params.game_uuid
        && (
            game = await new Game()
                .whereEquals('uuid', this.req.params.game_uuid)
                .first()
        )

        if (!this.req.params.game_uuid || !game) {
            this.sendJsend(404, 'error', {})

            return
        }

        if (
            game.row.password
            && game.row.password !== this.req.body.password
        ) {

            this.sendJsend(
                400,
                'error',
                {
                    password: 'That password is incorrect'
                }
            )
            return
        }

        if (
            await game.players()
                .handle()
                .count()
            >= game.row.max_players
        ) {
            this.sendJsend(
                400,
                'error',
                {
                    max_players: 'That game is now full, please choose another'
                }
            )

            return
        }

        await this.req.user_model
            .joinGame(game)

        this.sendJsend(
            200,
            'success',
            {}
        )
    }

    async create(): Promise<void> {
        if (this.req.user_model.row.current_game) {
            this.sendJsend(
                422,
                'error',
                {
                    errors: {
                        host: 'You are in a game already! Please leave or complete if before creating another',
                    }
                }
            )

            return
        }

        //TODO: password encryption
        const game = await new Game()
            .create({
                host_id: this.req.user_model.row.id,
                uuid: createUniqueId('game'),
                ...this.req.validated_data
            })

        await this.req.user_model
            .joinGame(game)

        const redis_client = await RedisConnection.getClient()
        await redis_client.sendCommand([
            'HMSET',
            `game.${game.row.id}.state`,
            'is_started',
            'false',
            'is_czar_phase',
            'false',
            'current_czar',
            '',
            'max_score',
            `${game.row.max_score}`
        ])

        await redis_client.lPush(`game.${game.row.id}.deck`, shuffle(game_deck))

        //TODO: queue driver ('redis') should be an env variable
        const response = await new CreateQueueService()
            .handle('game', 'redis')

        console.log(response)

        if (response?.status == 200) {
            await game.update({
                queue_id: response.data.data.queue_id
            })
        }

        this.sendJsend(
            200,
            'success',
            {}
        )
    }
}

export default GameController