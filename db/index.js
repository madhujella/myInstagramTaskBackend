const { Pool } = require('pg');
require('dotenv').config()

const config = {
    server: process.env.server,
    port: process.env.port,
    database: process.env.database,
    user: process.env.user,
    password: process.env.password
}

const pool = new Pool(config)(async () => {

    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        const userTable = `CREATE TABLE User ( 
            userId INTEGER NOT NULL SERIAL PRIMARY KEY,
            email VARCHAR(100) NOT NULL,
            username VARCHAR(30) NOT NULL,
            password VARCHAR(255) NOT NULL,
            profile_avatar VARCHAR(100) NOT NULL,
            createdOn TIMESTAMP NOT NULL
        )`
        const photoTable = `CREATE TABLE Photo (
            photoId INTEGER NOT NULL SERIAL PRIMARY KEY,
            caption VARCHAR(255),
            userId INTEGER REFERENCES User(userId),
            url VARCHAR(255),
            createdOn TIMESTAMP NOT NULL
        )`
        const favoriteTable = `CREATE TABLE Favorite (
            photoId INTEGER NOT NULL REFERENCES Photo(photoId) PRIMARY KEY,
            likerId INTEGER NOT NULL REFERENCES User(userId)
        )`
        await client.query(userTable)
        await client.query(photoTable)
        await client.query(favoriteTable)



        await client.query('COMMIT')
    } catch (e) {
        await client.query('ROLLBACK')
        throw e
    } finally {
        client.release()
    }
})().catch(e => console.error(e.stack))

module.exports = {
    query: (text, params) => pool.query(text, params),
}