const jwt = require('jsonwebtoken')
const { validation } = require('../utility')
const db = require('../db')
const {error} = require('../utility')


const mainpage = async (req, res, next) => {
    const userId = req.userId
    try {
        const result = await db.query('SELECT * FROM photo WHERE userId=$1', [userId])
        res.status(200).json({data: result.rows})
    } catch (e) {
        console.log(e)
        res.status(404).json({message: 'No Photos Found'})
        error('No Photos found', 404)
    }
}

const fav = async (req, res, next) => {
    validation(req, res, next)
    
    try {

    }catch(e){

    }

}

const editProfile = async (req, res, next) => {
    validation(req, res, next)

    try {
        await db.query('INSERT INTO DB')
    }catch(e){
        console.log(e)
    }
}

const userProfile = async (req, res, next) => {
    const userId = req.params.userId
    try{
        const results = await db.query('SELECT * FROM Photo WHERE userId=$1', [userId])
        res.status(200).json({userId: results.rows.userId, photos: results.rows})
    }catch(e){
        console.log(e)
        res.status(404).json({message: 'No Photos Found'})
        error('No Photos found', 404)
    }
}

const photo = async (req, res, next) => {
    const photoId = req.params.photoId
    try{
        const result = await db.query('SELECT * FROM Photo WHERE photoId=$1', [photoId])
        res.status(200).json({data: result.rows})
    } catch(e) {
        console.log(e)
        res.status(404).json({message: 'Cannot find photo'})
        error('Cannot find photo')
    }
}

module.exports = { mainpage, fav, editProfile, userProfile, photo }