const defaultState = {
    scoreboard: [],
    player_data: {},
    cards_in_play: {},
    hand: []
}

class GameData {
    public static player_data: GenericObject
    public static actions: { [key: string]: Function } = {
        'game-state'(uuid, data) {
            !GameData.player_data[uuid]
            && (GameData.player_data[uuid] = {})

            GameData.player_data[uuid].scoreboard = data.game.players
            GameData.player_data[uuid].black_card = data.game.current_card
            GameData.player_data[uuid].hand = data.hand
            GameData.player_data[uuid].own_cards_in_play = data.game.own_cards_in_play || []
            GameData.player_data[uuid].cards_in_play_count = data.game.cards_in_play_count
            GameData.player_data[uuid].cards_in_play = data.game.cards_in_play
            GameData.player_data[uuid].is_czar = data.game.is_current_czar
            GameData.player_data[uuid].is_czar_phase = data.game.is_czar_phase
            GameData.player_data[uuid].game_started = data.game.is_started
            GameData.player_data[uuid].is_host = data.game.is_host
        },
        'game-started'(uuid, data) {
            GameData.player_data[uuid].is_czar = data.is_czar
            GameData.player_data[uuid].game_started = true
        },
        'player-selected'(uuid) {
            GameData.player_data[uuid].cards_in_play_count =
                (
                    GameData.player_data[uuid].cards_in_play_count
                    || 0
                )
                + 1
        },
        'czar-phase-start'(uuid, data) {
            GameData.player_data[uuid].is_czar_phase = true
            GameData.player_data[uuid].cards_in_play = data.cards_in_play
            GameData.player_data[uuid].cards_in_play_count = 0
        },
        'player-joined'(uuid, name) {
            GameData.player_data[uuid]
                .scoreboard
                .push({
                    name: name,
                    score: 0,
                })
        },
        'round-end'(uuid, {scoreboard, winner, hand, is_czar, card}) {
            GameData.player_data[uuid].scoreboard = scoreboard
            GameData.player_data[uuid].cards_in_play = {}
            GameData.player_data[uuid].is_czar = is_czar
            GameData.player_data[uuid].hand = hand
            GameData.player_data[uuid].is_czar_phase = false
            GameData.player_data[uuid].own_cards_in_play = []
            GameData.player_data[uuid].black_card = card
        },
        'game-won'(uuid, data) {
            GameData.player_data[uuid].winner_name = data.name
        },
        'player-left'(uuid, data) {
            GameData.player_data[uuid].cards_in_play = data.cards_in_play
            GameData.player_data[uuid].hand = data.hand
            GameData.player_data[uuid].is_czar = data.is_czar
            GameData.player_data[uuid].is_czar_phase = data.is_czar_phase
            GameData.player_data[uuid].players = data.scoreboard
        },
    }

    static reset(): typeof GameData {
        GameData.player_data = {}

        return GameData
    }

    static pushUser(uuid: string): void {
        GameData.player_data[uuid] = JSON.parse(JSON.stringify(defaultState))
    }

    static takeAction(uuid: string, action: string, data: any = null) {
        !GameData.player_data[uuid]
        && (GameData.player_data[uuid] = {})

        GameData.actions[action](uuid, data)
    }

    static takeActionForAllExcluding(action: string, data: any, excluded_uuid: string = null) {
        Object.keys(GameData.player_data)
            .filter(uuid => uuid !== excluded_uuid)
            .forEach(
                uuid => {
                    GameData.takeAction(uuid, action, data)
                },
            )
    }
}

export default GameData