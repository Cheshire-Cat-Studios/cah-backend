import {
	Table,
	Column
} from '@cheshire-cat-studios/jester'

export default () => {
	return new Table()
		.setName('users')
		.create((column: () => Column) => {
			column().id()

			column().string('uuid', 100)
				.setUnique(true)

			column().string('name', 100)

			// column().string('secret', 100)

			column().integer('current_game')
				.setNullable()

			column().dateTime('last_active')
		})
}