const UserFactory = require('../factories/UserFactory')

module.exports = async () => {
	await new UserFactory()
		.setCount(3)
		.store()
}