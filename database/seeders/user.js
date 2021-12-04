const UserFactory = require('../factories/UserFactory')

module.exports = () => {
	new UserFactory()
		.setCount(3)
		.store()
}