const jwt = require('jsonwebtoken')
const { validation } = require('../utility')
const db = require('../db')


const mainpage = async (req, res, next) => {
    const userId = req.userId
    try {
        const result = await db.query('SELECT * FROM photo WHERE userId=$1', [userId])
        res.statusCode(200).json(result.rows)
    } catch (e) {
        res.statusCode(404).json(e)
    }
}

const fav = async (req, res, next) => {
    validation(req)

}

const editProfile = async (req, res, next) => {
    validation(req)

}

const userProfile = async (req, res, next) => {
    const userId = req.params.userId
    try{
        const results = await db.query('SELECT * FROM Photo WHERE userId=$1', [userId])
        res.statusCode(200).json({userId: results.rows.userId, photos: results.rows})
    }
}

const photo = async (req, res, next) => {

}

module.exports = { mainpage, fav, editProfile, userProfile, photo }