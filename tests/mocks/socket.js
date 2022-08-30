const base_socket_data = {
	players: {},
	cards_in_play: {},
	hand: [],
	is_czar: false,
	is_czar_phase: false
}

let game_data = require('./game-data')

const createMockedSocket = user => ({
	socket_data: {},
	user: user.row,
	join: () => {
	},
	broadcast: {
		user: user.row,
		to() {
			self = this

			return {
				emit(event, data) {
					game_data.takeActionForAllExcluding(
						event,
						data,
						self.user.uuid
					)
				}
			}
		}

	},
	to() {
		self = this

		return {
			emit(event, data) {
				game_data.takeActionForAllExcluding(
					event,
					data,
					self.user.uuid,
				)
			}
		}
	},
	emit(event, data, log) {
		game_data.takeAction(
			this.user.uuid,
			event,
			data
		)
	},
	leave(){
		//TODO: does this need logic?
	},
	disconnect(){
		game_data.takeAction(
			this.user.uuid,
			'leave'
		)
		//TODO: does this need logic?
	},
	in() {
		return {
			emit(event, data) {
				game_data.takeActionForAllExcluding(
					event,
					data,
				)
			},
			fetchSockets() {
				return Object.keys(game_data.player_data)
					.map(uuid => createMockedSocket({row: {uuid}}))
			}
		}
	}
})


module.exports = createMockedSocket
