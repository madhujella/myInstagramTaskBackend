const { Pool } = require('pg');
require('dotenv').config()
const bcrypt = require('bcryptjs')

const config = {
    server: process.env.server,
    port: process.env.port,
    database: process.env.database,
    user: process.env.user,
    password: process.env.password
}

const pool = new Pool(config);
(async () => {

    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        const userTable = `CREATE TABLE IF NOT EXISTS users ( 
            userid SERIAL PRIMARY KEY,
            email VARCHAR(100) NOT NULL,
            username VARCHAR(30) NOT NULL,
            password VARCHAR(255) NOT NULL,
            profile_avatar VARCHAR(100) NOT NULL,
            createdon TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
        const photoTable = `CREATE TABLE IF NOT EXISTS photos (
            photoid SERIAL PRIMARY KEY,
            caption VARCHAR(255),
            userid INTEGER REFERENCES users(userid),
            url VARCHAR(255),
            createdon TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
        const favoriteTable = `CREATE TABLE IF NOT EXISTS favorites (
            photoid INTEGER NOT NULL REFERENCES photos(photoid),
            likerid INTEGER NOT NULL REFERENCES users(userid) 
        )`
        await client.query(userTable)
        await client.query(photoTable)
        await client.query(favoriteTable)

        const hashPw = await bcrypt.hash('password', 12)

        const insertUsers = `INSERT INTO users(userid, email, username, password, profile_avatar) VALUES
                                (100, 'test1@test.com', 'test1', $1, 'default.jpg'),
                                (101, 'test2@test.com', 'test2', $2, 'default.jpg'),
                                (102, 'test3@test.com', 'test3', $3, 'default.jpg') 
                                ON CONFLICT DO NOTHING`

        const insertPhotos = `INSERT INTO photos(userid, photoid, caption, url) VALUES
                                (101, 1, 'pic1', 'default.jpg'),
                                (101, 2, 'pic2', 'default.jpg'),
                                (100, 3, 'pic3', 'default.jpg'),
                                (100, 4, 'pic4', 'default.jpg'),
                                (102, 5, 'pic5', 'default.jpg'),
                                (102, 6, 'pic6', 'default.jpg'),
                                (100, 7, 'pic7', 'default.jpg') ON CONFLICT DO NOTHING`

        const insertFav = `INSERT INTO favorites(photoid, likerid) VALUES
                                (1, 100),
                                (7, 101), 
                                (7, 102),
                                (1, 102),
                                (1, 101) ON CONFLICT DO NOTHING`

        await client.query(insertUsers, [hashPw, hashPw, hashPw])
        await client.query(insertPhotos)
        await client.query(insertFav)

        const resU = await client.query('SELECT * FROM users')
        console.table(resU.rows)
        const resp = await client.query('SELECT * FROM photos')
        console.table(resp.rows)
        const resf = await client.query('SELECT * FROM favorites')
        console.table(resf.rows)

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