import {
    Table,
    Column
} from '@cheshire-cat-studios/jester'

export default (): Table => {
    return new Table()
        .setName('games')
        .create((column: () => Column) => {
            column().id()

            column()
                .string('uuid', 100)
                .setUnique(true)

            column()
                .string('name', 100)

            column()
                .string('password', 100)

            column()
                .integer('host_id')

            column()
                .integer('queue_id')
                .setNullable()

            column()
                .boolean('max_score')

            column()
                .boolean('max_players')

            column()
                .boolean('round_time_limit_mins')

            column()
                .boolean('game_time_limit_mins')

            column()
                .dateTime('round_ends_at')
                .setNullable()
                .setDefault('NULL', true)

            column()
                .dateTime('game_ends_at')
                .setNullable()
                .setDefault('NULL', true)
        })
}