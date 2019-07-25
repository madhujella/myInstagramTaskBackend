const express = require('express')
const bodyparser = require('body-parser')
const routes = require('./routes/routes')
const path = require('path')

const app = express()

app.use(bodyparser.json())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/', routes)


app.listen(3001, () => {
    console.log('listening at port 3001')
})