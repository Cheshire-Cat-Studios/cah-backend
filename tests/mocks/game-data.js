const defaultState = {
		scoreboard: [],
		player_data: {},
		cards_in_play: {},
		hand: []
	}

//This is mocked client socket game data!!! the true game data exists in redis!!!
//TODO: abstract into a class?
module.exports = {
	player_data: {},
	actions: {
		'game-state'(uuid, data){
			this.player_data[uuid].scoreboard = data.game.players
			this.player_data[uuid].black_card = data.game.current_card
			this.player_data[uuid].hand = data.hand
			this.player_data[uuid].own_cards_in_play = data.game.own_cards_in_play || []
			this.player_data[uuid].cards_in_play_count = data.game.cards_in_play_count
			this.player_data[uuid].cards_in_play = data.game.cards_in_play
			this.player_data[uuid].is_czar = data.game.is_current_czar
			this.player_data[uuid].is_czar_phase = data.game.is_czar_phase
			this.player_data[uuid].game_started = data.game.is_started
			this.player_data[uuid].is_host = data.game.is_host
		},
		'game-started'(uuid, data){
			this.player_data[uuid].is_czar = data.is_czar
			this.player_data[uuid].game_started = true
		},
		'player-selected'(uuid){
			this.player_data[uuid].cards_in_play_count =
				(
					this.player_data[uuid].cards_in_play_count
					|| 0
				)
				+ 1
		},
		'czar-phase-start'(uuid, data){
			this.player_data[uuid].is_czar_phase = true
			this.player_data[uuid].cards_in_play = data.cards_in_play
			this.player_data[uuid].cards_in_play_count = 0
		},
		'player-joined'(uuid, name){
			this.player_data[uuid]
				.scoreboard
				.push({
					name: name,
					score: 0,
				})
		},
		'round-end'(uuid, {scoreboard, winner, hand, is_czar, card}){
			this.player_data[uuid].scoreboard = scoreboard
			this.player_data[uuid].cards_in_play = {}
			this.player_data[uuid].is_czar = is_czar
			this.player_data[uuid].hand = hand
			this.player_data[uuid].is_czar_phase = false
			this.player_data[uuid].own_cards_in_play = []
			this.player_data[uuid].black_card = card
		},
		'game-won'(uuid, data){
			this.player_data[uuid].winner_name = data.name
		},
		'player-left'(uuid, data){
			this.player_data[uuid].cards_in_play = data.cards_in_play
			this.player_data[uuid].hand = data.hand
			this.player_data[uuid].is_czar = data.is_czar
			this.player_data[uuid].is_czar_phase = data.is_czar_phase
			this.player_data[uuid].players = data.scoreboard
		}
	},
	init(){
		this.actions.player_data = this.player_data

		return this
	},
	reset() {
		this.player_data = {}

		return this
	},
	pushUser(uuid){
		this.player_data[uuid] = JSON.parse(JSON.stringify(defaultState))
	},
	takeAction(uuid, action, data) {
		!this.player_data[uuid]
		&& (this.player_data[uuid] = {})

		this.actions[action](uuid, data)
	},
	takeActionForAllExcluding(action, data, excluded_uuid){
		Object.keys(this.player_data)
			.filter(uuid => uuid !== excluded_uuid)
			.forEach(
				uuid => {
					this.takeAction(uuid, action, data)
				},
				this
			)
	}
}