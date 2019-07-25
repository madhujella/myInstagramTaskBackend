const express = require('express')
const handlers = require('../controllers')
const isAuth = require('../middlewares/is-auth')
const { check } = require('express-validator')

const router = express.Router();

router.get('/mainpage', isAuth, handlers.photos.mainpage)

router.get('/:userId', handlers.photos.userProfile)
router.get('/:photoId', handlers.photos.photo)

router.post('/editprofile', isAuth,[
    check('userId').not().isEmpty(),
    check('username').isLength({min: 5}),
    check('password').isLength({min: 5}),
    check('token').isJWT()
], handlers.photos.editProfile)

router.post('/fav', isAuth,[
    check('token').isJWT(),
    check('userId').not().isEmpty()
], handlers.photos.fav)

router.post('/login', [
    check('username').isLength({min: 5}),
    check('password').isLength({min: 5})
], handlers.auth.login)

router.post('/register', [
    check('email').isEmail().normalizeEmail(),
    check('username').isLength({min: 5}),
    check('password').isLength({min: 5})
], handlers.auth.register)

router.post('/logout', isAuth, handlers.auth.logout)

module.exports = router;