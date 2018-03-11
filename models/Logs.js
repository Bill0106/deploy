const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LogsSchema = new Schema({
  contents: {
    type: String,
    required: true,
  },
}, {
  timestamps: true
})

module.exports = mongoose.model('Logs', LogsSchema)
