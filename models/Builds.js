const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BuildsSchema = new Schema({
  commit_id: {
    type: Schema.Types.ObjectId,
    required: true,
    index: { unique: true },
    ref: 'Commits'
  },
  dist_files: {
    type: [String],
    required
  },
  published: {
    type: Boolean,
    default: false,
  },
  publishedAt: Date,
}, {
  timestamps: true
})

module.exports = mongoose.model('builds', BuildsSchema)
