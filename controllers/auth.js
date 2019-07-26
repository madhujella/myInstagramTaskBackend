const db = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { error, validation } = require('../utility')

require('dotenv').config()

const register = async (req, res, next) => {
    validation(req, res, next)
    const { email } = req.body
    const { username } = req.body
    const { password } = req.body


    const hashPwd = await bcrypt.hash(password, 12)
    try {
        await db.query('INSERT INTO users (username, password, email, profile_avatar) VALUES ($1, $2, $3, $4)', [username, hashPwd, email, 'default.jpg'])
        res.status(201).json({ message: 'success registration', error: null })
    } catch (e) {
        console.log(e)
        res.status(404).json({ error: 'error inserting', message: e })
    }
    next()
}

const login = async (req, res, next) => {
    validation(req, res, next)
    const { username } = req.body
    const { password } = req.body

    try {
        const result = await db.query('SELECT * from users WHERE username=$1', [username])
        const hash = await bcrypt.compare(password, result.rows[0].password)
        if (!hash) {
            res.status(422).json({message: 'password invalid'})
            error('Invalid password', 422)
        }

        const token = jwt.sign({
            userid: result.rows[0].userid, 
            username: result.rows[0].username, 
            email: result.rows[0].email
        }, process.env.secret)
        res.status(200).json({ userid: result.rows[0].userid, email: result.rows[0].email, token})
    } catch (e) {
        console.log(e)
        res.status(404).json({ message: 'No user found' })
        error(e, 404);
    }
    next()
}

const logout = async (req, res, next) => {
    next()
}

module.exports = { register, login, logout }