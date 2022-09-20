import GameData from './GameData.js'

const base_socket_data = {
	players: {},
	cards_in_play: {},
	hand: [],
	is_czar: false,
	is_czar_phase: false
}

//TODO: this is a mess, it needs objectifying
const createMockedSocket = user => ({
	socket_data: {},
	user: user.row,
	join: () => {
	},
	broadcast: {
		user: user.row,
		to() {
			const self = this

			return {
				emit(event, data) {
					GameData.takeActionForAllExcluding(
						event,
						data,
						// @ts-ignore
						self.user.uuid
					)
				}
			}
		}

	},
	to() {
		const self = this

		return {
			emit(event, data) {
				GameData.takeActionForAllExcluding(
					event,
					data,
					// @ts-ignore
					self.user.uuid,
				)
			}
		}
	},
	emit(event, data, log) {
		GameData.takeAction(
			this.user.uuid,
			event,
			data
		)
	},
	leave(){
		//TODO: does this need logic?
	},
	disconnect(){
		GameData.takeAction(
			this.user.uuid,
			'leave'
		)
		//TODO: does this need logic?
	},
	in() {
		return {
			emit(event, data) {
				GameData.takeActionForAllExcluding(
					event,
					data,
				)
			},
			fetchSockets() {
				return Object.keys(GameData.player_data)
					.map(uuid => createMockedSocket({row: {uuid}}))
			}
		}
	}
})


export default createMockedSocket
