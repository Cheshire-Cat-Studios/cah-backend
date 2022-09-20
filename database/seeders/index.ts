import game from '../seeders/game.js'
import user from '../seeders/user.js'

export default async () => {
	await game()
	await user()
}