const crypto = require('crypto')
const token = require('../config/token')
const Commits = require('../models/Commits')

module.exports = (req, res) => {
  const { head_commit, repository, ref } = req.body
  const repos = ['site-frontend-admin', 'site-frontend-app']

  try {
    if (!repos.includes(repository.name)) {
      throw new Error('No such repository')
    }

    const hmac = crypto.createHmac('sha1', token.GITHUB_TOKEN)
    hmac.update(JSON.stringify(req.body))
    const sign = `sha1=${hmac.digest('hex')}`
    if (req.get('X-Hub-Signature') !== sign) {
      throw new Error('Sign is not correct')
    }

    const commit = {
      ref,
      repo: repository.name,
      commit_id: head_commit.id,
      commit_message: head_commit.message,
      committer_name: head_commit.author.name,
      committer_email: head_commit.author.email,
      committedAt: head_commit.timestamp,
    }

    Commits.create(commit)
      .then(commit => res.sendStatus(200))
      .catch(err => {
        throw new Error(err)
      })
  } catch(error) {
    res.status(500).send(error.message)
  }
}
