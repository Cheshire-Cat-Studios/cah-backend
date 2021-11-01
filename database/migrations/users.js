//TODO: convert to laravel style table migration (use closure wrapper logic from routes/query builder)
module.exports = {
    id: 'INTEGER PRIMARY KEY',
    uuid: 'VARCHAR(100) NOT NULL UNIQUE',
    name: 'VARCHAR(100) NOT NULL',
    secret: 'VARCHAR(100) NOT NULL',
    current_game: 'INTEGER',
    score: 'INTEGER',
    taken_turn: 'TINYINT(1)',
    is_czar: 'TINYINT(1)',
}