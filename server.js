const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bluebird = require('bluebird')
const routes = require('./app')
const app = express()
const server = require('http').Server(app)
require('./app/socket')(server)

mongoose.Promise = bluebird
mongoose.connect('mongodb://localhost/code')

mongoose.connection.on('connected', function () {
  console.log('Database is connected');
})

mongoose.connection.on('error',function (err) {
  console.log('Mongoose default connection error: ' + err);
})

app.set('views', path.join(__dirname, '/app'))
app.set('view engine', 'pug')

app.use(bodyParser.json())
app.use('/', routes)

server.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
