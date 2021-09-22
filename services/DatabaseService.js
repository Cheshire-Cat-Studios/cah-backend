const Sqlite = require('better-sqlite3')

module.exports = class DatabaseService {
    database = new Sqlite(process.env.SQLITE_FILE)

    createTable(name, data) {
        let query = `CREATE TABLE IF NOT EXISTS ${name} (`

        Object.keys(data).forEach((name, index, array) => {
            query += `${name} ${data[name]}${Object.is(array.length - 1, index) ? ');' : ', '}`
        })

        // console.log(query, data)
        this.database
            .prepare(query)
            .run()
    }

    selectFrom(name, data, cols = '*') {
        let query = `SELECT ${cols} FROM ${name}`

        data
        && Object.keys(data)
            .forEach((name, index, array) => {
                query += `WHERE ${name} = @${name}${data[name]}${Object.is(array.length - 1, index) ? '' : ' AND '}`
            })

        // console.log(query)
        return this.database
            .prepare(query)
            .all()
    }

    insert(name, data) {
        let query = `INSERT INTO ${name} VALUES(`

        Object.keys(data)
            .forEach((column, index, array) => {
                // query += `${column}${Object.is(array.length - 1, index) ? ')' : ', '}`
                query += `@${column}${Object.is(array.length - 1, index) ? ')' : ', '}`
            })

        // console.log(query, data)

        this.database
            .prepare(query)
            .run(data)
    }


}