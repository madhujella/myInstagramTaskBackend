const db = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { error, validation } = require('../utility')
require('dotenv').config()

const register = async (req, res, next) => {
    validation(req)
    const { email } = req.body
    const { username } = req.body
    const { password } = req.body

    try {
        await db.query('SELECT * from user WHERE email=$1 AND username=$2', [email, username])
        error('Email or Username already Registered', 401)
    } catch (e) {
        const hashPwd = await bcrypt.hash(password, 12)
        try {
            await db.query('INSERT INTO user (username, password, email, profile_avatar) VALUES ($1, $2, $3, $4)', [username, hashPwd, email, 'default.jpg'])
            res.statusCode(201).json({ message: 'success' })
        } catch (e) {
            console.log(e)
            res.statusCode(404)
        }

    }
}

const login = async (req, res, next) => {
    validation(req)
    const { username } = req.body
    const { password } = req.body

    try {
        const result = await db.query('SELECT * from user WHERE username=$1', [username])
        const hash = await bcrypt.compare(password, result.rows.password)
        if (!hash) {
            error('Invalid password', 404)
        }

        const token = jwt.sign(JSON.stringify(result.rows.userId, result.rows.username, result.rows.email), process.env.secret)
        res.statusCode(200).json({ token, userId: result.rows.userId })
    } catch (e) {
        console.log(e)
        res.statusCode(404).json({ message: 'No user found' })
        error(e, 404);
    }
}

const logout = async (req, res, next) => {

}

module.exports = { register, login, logout }