const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bluebird = require('bluebird')
const routes = require('./app/routes')
const app = express()
const server = require('http').Server(app)
require('./app/socket')(server)

mongoose.Promise = bluebird
mongoose.connect('mongodb://localhost/code')

app.set('views', path.join(__dirname, '/app'))
app.set('view engine', 'pug')

app.use(bodyParser.json())
app.use('/', routes)

server.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
