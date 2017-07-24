const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bluebird = require('bluebird')
const routes = require('./app')
const app = express()

mongoose.Promise = bluebird
mongoose.connect('mongodb://localhost/code')

mongoose.connection.on('connected', function () {
  console.log('Database is connected');
})

mongoose.connection.on('error',function (err) {
  console.log('Mongoose default connection error: ' + err);
})

app.use(bodyParser.json())
app.use('/', routes)

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
