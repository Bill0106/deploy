const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bluebird = require('bluebird')
const routes = require('./routes')
// const sockets = require('./sockets')
const app = express()

const server = require('http').Server(app)
// const io = require('socket.io')(server)

mongoose.Promise = bluebird
mongoose.connect('mongodb://localhost/database')

app.use(bodyParser.json())
app.use(express.static('public'))
app.use('/', routes)

// io.on('connection', socket => sockets(socket))

server.listen(3000, function () {
  console.log('App listening on port 3000!')
})
