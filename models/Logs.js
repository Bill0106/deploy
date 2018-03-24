const mongoose = require('mongoose')
const Schema = mongoose.Schema

const LogsSchema = new Schema({
  contents: {
    type: String,
    required: true,
  },
  build_id: {
    type: Schema.Types.ObjectId,
    index: { unique: true },
    ref: 'Builds',
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Logs', LogsSchema)
