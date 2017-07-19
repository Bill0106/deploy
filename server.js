const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const crypto = require('crypto')
const GITHUB_TOKEN = require('./token')
const app = express()

mongoose.connect('mongodb://localhost/code_versions')
mongoose.connection.on('error', console.error)

const Schema = mongoose.Schema
const Commits = mongoose.model('commits', new Schema({
  repo: String,
  built: { type: Boolean, default: false },
  dist_files: { type: String, default: '' },
  commit_id: { type: Schema.Types.String, index: { unique: true } },
  commit_message: String,
  committer_name: String,
  committer_email: String,
  committedAt: Date,
}, { timestamps: true }))

app.use(bodyParser.json())

app.post('/', (req, res) => {
  const { head_commit, repository } = req.body
  const saved = []
  const repoMapping = {
    'site-frontend-admin': 'admin',
    'site-frontend-app': 'app'
  }

  try {
    const repo = repoMapping[repository.name]
    if (!repo) {
      throw new Error('No such repository')
    }

    const hmac = crypto.createHmac('sha1', GITHUB_TOKEN)
    hmac.update(JSON.stringify(req.body))
    const sign = `sha1=${hmac.digest('hex')}`
    if (req.get('X-Hub-Signature') !== sign) {
      throw new Error('Sign is not correct')
    }

    const commit = {
      repo,
      commit_id: head_commit.id,
      commit_message: head_commit.message,
      committer_name: head_commit.author.name,
      committer_email: head_commit.author.email,
      committedAt: head_commit.timestamp
    }

    Commits.create(commit, (err, commit) => {
      if (err) {
        throw new Error(err)
      }

      res.sendStatus(200)
    })
  } catch (error) {
    res.status(500).send(error.message)
  }
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
