const crypto = require('crypto')
const moment = require('moment')
const token = require('./token')
const Commits = require('./models/CommitsModel')

const index = (req, res) => {
  const repo = req.query.repo || 'site-frontend-admin'
  const limit = 30
  const page = Number(req.query.page) || 1
  const offset = limit * (page - 1)

  Commits.where('repo', repo).limit(limit).skip(offset).sort({ committedAt: 'desc' }).find().exec()
    .then(data => {
      const commits = data.map(item => {
        let dist_files = ''
        if (item.dist_files) {
          const files = JSON.parse(item.dist_files)
          dist_files = Object.keys(files).map(item => files[item]).join(', ')
        }

        return {
          _id: item._id,
          commit_id: item.commit_id,
          commit_message: item.commit_message,
          committer_name: item.committer_name,
          committer_email: item.committer_email,
          committedAt: moment(item.committedAt).format('YYYY-MM-DD hh:mm:ss'),
          published: item.published,
          dist_files,
        }
      })

      res.render('commits', { commits, repo })
    })
    .catch(err => {
      console.log(err)
      res.sendStatus(500)
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
