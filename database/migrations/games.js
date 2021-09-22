module.exports = {
    id: 'INTEGER PRIMARY KEY',
    uuid: 'VARCHAR(100) NOT NULL UNIQUE',
    name: 'VARCHAR(100) NOT NULL',
    password: 'VARCHAR(100) NOT NULL',
    host_id: 'INT NOT NULL',
    is_started: 'tinyint(1) NOT NULL',
    is_czar_phase: 'tinyint(1) NOT NULL',
    max_score:'INT NOT NULL',
    max_players:'INT NOT NULL',
    round_time_limit_mins:'INT NOT NULL',
    game_time_limit_mins:'INT NOT NULL',
}