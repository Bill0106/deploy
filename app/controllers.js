const crypto = require('crypto')
const token = require('./token')
const Commits = require('./models/CommitsModel')

const index = (req, res) => {
  const repo = req.query.repo || 'site-frontend-admin'
  const limit = 30
  const page = Number(req.query.page) || 1
  const offset = limit * (page - 1)
  Commits.where('repo', repo).limit(limit).skip(offset).find((err, commits) => {
    if (err) res.sendStatus(500)

    res.render('commits', { commits })
  })
}

const webhook = (req, res) => {
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

    Commits.create(commit, (err, commit) => {
      if (err) {
        throw new Error(err)
      }

      res.sendStatus(200)
    })
  } catch(error) {
    res.status(500).send(error.message)
  }
}

module.exports = {
  index,
  webhook,
}
