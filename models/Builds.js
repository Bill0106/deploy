const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BuildsSchema = new Schema({
  dist_files: {
    type: String,
    required: true
  },
  published: {
    type: Boolean,
    default: false,
  },
  publishedAt: Date,
}, {
  timestamps: true
})

module.exports = mongoose.model('Builds', BuildsSchema)
