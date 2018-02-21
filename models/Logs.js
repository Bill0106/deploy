const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LogsSchema = new Schema({
  commit_id: {
    type: Schema.Types.ObjectId,
    required: true,
    index: { unique: true },
    ref: 'Commits'
  },
  contents: String,
}, {
  timestamps: true
})

module.exports = mongoose.model('Logs', LogsSchema)
