const express = require('express')
const handlers = require('../controllers')
const isAuth = require('../middlewares/is-auth')
const { body } = require('express-validator')
const db = require('../db')

const router = express.Router();

router.get('/mainpage', isAuth, handlers.photos.mainpage)

router.get('/user/:userid', handlers.photos.userProfile)
router.get('/photo/:photoid', handlers.photos.photo)

router.post('/editprofile', isAuth, [
    body('userid').trim().not().isEmpty(),
    body('email').trim().isEmail().normalizeEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('token').trim().isJWT()
], handlers.photos.editProfile)

router.post('/fav', isAuth, [
    body('token').trim().isJWT(),
    body('userid').trim().not().isEmpty(),
    body('shouldfav').trim().isBoolean(),
    body('photoid').trim().not().isEmpty()
], handlers.photos.fav)

router.post('/login', [
    body('username').trim().isLength({ min: 2 }),
    body('password').trim().isLength({ min: 2 })
], handlers.auth.login)

router.post('/register', [
    body('email').isEmail().normalizeEmail()
        .custom((value, { req }) => {
            return db.query('SELECT * FROM users WHERE email=$1', [value]).then(result => {
                if (result.rowCount) {
                    return Promise.reject('E-Mail address already exists!');
                }
            });
        }),
    body('username').isLength({ min: 2 })
        .custom((value, { req }) => {
            return db.query('SELECT * FROM users WHERE username=$1', [value]).then(result => {
                if (result.rowCount) {
                    return Promise.reject('Username already exists');
                }
            })
        }),
    body('password').isLength({ min: 2 })
], handlers.auth.register)

router.post('/logout', isAuth, handlers.auth.logout)

module.exports = router;