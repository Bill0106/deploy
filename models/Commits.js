const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CommitsSchema = new Schema({
  ref: {
    type: String,
    required: true,
  },
  repo: {
    type: String,
    index: true,
  },
  commit_id: {
    type: Schema.Types.String,
    index: { unique: true }
  },
  commit_message: {
    type: String,
    required: true,
  },
  committer_name: {
    type: String,
    required: true,
  },
  committer_email: {
    type: String,
    required: true,
  },
  committedAt: {
    type: Date,
    required: true,
  },
  build_id: {
    type: Schema.Types.ObjectId,
    index: { unique: true },
    ref: 'Builds'
  },
}, {
  timestamps: true
})

module.exports = mongoose.model('Commits', CommitsSchema)
