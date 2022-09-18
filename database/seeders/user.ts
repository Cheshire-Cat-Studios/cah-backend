import UserFactory from '../factories/UserFactory.js'

export default async () => {
    await new UserFactory()
        .setCount(3)
        .store()
}