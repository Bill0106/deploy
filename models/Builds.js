const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BuildsSchema = new Schema({
  dist_files: {
    type: [String],
    required: true
  },
  published: {
    type: Boolean,
    default: false,
  },
  publishedAt: Date,
  log_id: {
    type: Schema.Types.ObjectId,
    index: { unique: true },
    ref: 'Logs',
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('builds', BuildsSchema)
