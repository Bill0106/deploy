const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LogsSchema = new Schema({
  commit_id: { type: Schema.Types.ObjectId, unique: true },
  log: String,
}, {
  timestamps: true
})

module.exports = mongoose.model('Logs', LogsSchema)
