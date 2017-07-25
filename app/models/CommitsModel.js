const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CommitsSchema = new Schema({
  ref: String,
  repo: String,
  published: { type: Boolean, default: false },
  dist_files: { type: String, default: '' },
  commit_id: { type: Schema.Types.String, index: { unique: true } },
  commit_message: String,
  committer_name: String,
  committer_email: String,
  committedAt: Date,
}, {
  timestamps: true
})

module.exports = mongoose.model('Commits', CommitsSchema)
