const jwt = require('jsonwebtoken')
const db = require('../db')
const { error } = require('../utility')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')


const mainpage = async (req, res, next) => {
    const userid = req.userid
    try {
        const userPhotos = await db.query('SELECT * FROM photos WHERE userid=$1', [userid])
        const userFavd = await db.query(`select photos.photoid, photos.userid, photos.url, photos.caption,
                                        favorites.likerid from photos
                                        left join favorites on favorites.photoid = photos.photoid
                                        where favorites.likerid=$1 AND photos.userid != $1`, [userid])
        res.status(200).json({ users: userPhotos.rows, favs: userFavd.rows })
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
        const isUser = await db.query('SELECT userid, username, profile_avatar, createdon FROM users WHERE userid=$1', [userid])
        if (isUser.rowCount) {
            const result = await db.query('SELECT * FROM photos WHERE userid=$1', [userid])
            res.status(200).json({ user: isUser.rows, data: result.rows })
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
    const userid = (req.userid) ? req.userid : null;
    console.log(userid)
    try {
        const photo = await db.query(`SELECT photos.userid, photos.photoid, photos.caption, photos.url, photos.createdon,
                                        users.username, users.profile_avatar
                                        FROM photos 
                                        INNER JOIN users ON users.userid = photos.userid
                                        WHERE photos.photoid = $1
                                        `, [photoid])
        if (photo.rowCount) {
            const favsCount = await db.query('SELECT * FROM favorites WHERE photoid=$1', [photoid])
            if(userid){
                const isFav = await db.query('SELECT * FROM favorites WHERE photoid=$1 AND likerid=$2', [photoid, userid])
                const isLoggedUserFavd = isFav.rowCount > 0 ? true: false;
                res.status(200).json({ data: photo.rows[0], favsCount: favsCount.rowCount, isFaved: isLoggedUserFavd })
            }else {
                res.status(200).json({ data: photo.rows[0], favsCount: favsCount.rowCount})
            }
        }else {
            res.status(404).json({ message: 'Post not found' })
        }
    } catch (e) {
        console.log(e)
        res.status(404).json({ message: 'Cannot find photo, server error' })
        error('Cannot find photo, server error')
    }
    next()
}

const editProfile = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

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
        const result = await db.query('UPDATE users SET password=$1 WHERE userid=$1', [hashPw, verifyUserid])
        res.status(201).json({ message: 'updated success' })
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'error updating details' })
    }
    next()
}

const fav = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
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