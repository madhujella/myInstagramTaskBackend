const jwt = require('jsonwebtoken')
const { validation } = require('../utility')
const db = require('../db')
const { error } = require('../utility')
const bcrypt = require('bcryptjs')

const mainpage = async (req, res, next) => {
    const userid = req.userid
    try {
        // const result = await db.query('SELECT * FROM photos WHERE userid=$1', [userid])
        const result = await db.query(`SELECT photos.userid, favorites.likerid, photos.createdon,
                            photos.photoid, photos.caption, photos.url, , favorites.likerid FROM favorites
                            LEFT JOIN photos ON photos.userid = favorites.likerid
                            LEFT JOIN users  ON users.userid = favorites.likerid
                            WHERE photos.userid=$1`, [userid])
        res.status(200).json({ data: result.rows })
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'No Photos Found, server error' })
        error('No Photos found, server error', 500)
    }
    next()
}

const userProfile = async (req, res, next) => {
    const userid = req.params.userid
    try {
        const isUser = await db.query('SELECT * FROM users WHERE userid=$1', [userid])
        if (isUser.rowCount) {
            const result = await db.query('SELECT * FROM photos WHERE userid=$1', [userid])
            res.status(200).json({ data: result.rows })
        } else {
            res.status(404).json({ message: 'User not found' })
            error('No user found', 404)
        }
    } catch (e) {
        console.log(e)
        res.status(404).json({ message: 'No Photos Found' })
        error('No Photos found', 404)
    }
    next()
}

const photo = async (req, res, next) => {
    const photoid = req.params.photoid
    try {
        const result = await db.query(`SELECT favorites.likerid, favorites.photoid, 
                                        photos.photoid, photos.userid, photos.caption, 
                                        photos.url, photos.createdon
                                        FROM favorites INNER JOIN photos 
                                        ON photos.photoid=favorites.photoid WHERE favorites.photoid=$1`, [photoid])
        res.status(200).json({ data: result.rows[0], favsCount: result.rowCount })
    } catch (e) {
        console.log(e)
        res.status(404).json({ message: 'Cannot find photo, server error' })
        error('Cannot find photo, server error')
    }
    next()
}

const editProfile = async (req, res, next) => {
    validation(req, res, next)
    const { email } = req.body;
    const { password } = req.body;
    const { userid } = req.body;
    const verifyUserid = req.userid;

    console.log(userid, verifyUserid)
    if (userid != verifyUserid) {
        res.status(401).json({ message: 'userid doesnt match with token' })
        error(401, 'userid doesnt match with token')
    }

    const hashPw = await bcrypt.hash(password, 12)
    try {
        const result = await db.query('UPDATE users SET email=$1, password=$2 WHERE userid=$3', [email, hashPw, verifyUserid])
        res.status(201).json({ message: 'updated success' })
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'error updating details' })
    }
    next()
}

const fav = async (req, res, next) => {
    validation(req, res, next)
    const { userid } = req;
    const { photoid } = req.body;
    const { shouldfav } = req.body;
    if (shouldfav == 'true') {
        try {
            const result = await db.query('INSERT INTO favorites (photoid, likerid) VALUES ($1, $2) ON CONFLICT DO NOTHING', [photoid, userid])
            res.status(201).json({ message: `favorited photo ${photoid} by user ${userid}` })
        } catch (e) {
            res.status(500).json({ message: 'something went wrong on fav or already faved' })
            error('something wnet wrong on fav', 500)
        }
    } else {
        try {
            const result = await db.query('DELETE FROM favorites WHERE likerid=$1 AND photoid=$2', [userid, photoid])
            res.status(201).json({ message: `unfavorited photo ${photoid} by user ${userid}` })
        } catch (e) {
            res.status(500).json({ message: 'something went wrong on unfav or already Unfaved' })
            error('something wnet wrong on funav', 500)
        }
    }
    next()
}

module.exports = { mainpage, fav, editProfile, userProfile, photo }