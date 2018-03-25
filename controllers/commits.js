const crypto = require('crypto')
const token = require('../config/token')
const Commits = require('../models/Commits')

const list = async (req, res) => {
  const { repo, limit, offset } = req.query

  try {
    if (!['app', 'admin', 'backend', 'deploy'].includes(repo)) {
      throw new Error('No such repository')
    }

    const commits = await Commits.find({ 'repo': repo, 'ref': 'refs/heads/master' })
      .sort({ committedAt: 'desc' })
      .limit(Number(limit) || 30)
      .skip(Number(offset) || 0)
      .populate('build_id')
      .exec()

    res.status(200).send(commits)
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
}

const create = async (req, res) => {
  const { repo } = req.params
  const { head_commit, ref } = req.body

  try {
    if (!['admin', 'app', 'backend', 'deploy'].includes(repo)) {
      throw new Error('No such repository')
    }

    const hmac = crypto.createHmac('sha1', token.GITHUB_TOKEN)
    hmac.update(JSON.stringify(req.body))
    const sign = `sha1=${hmac.digest('hex')}`

    const commit = {
      ref,
      repo,
      commit_id: head_commit.id,
      commit_message: head_commit.message,
      committer_name: head_commit.author.name,
      committer_email: head_commit.author.email,
      committedAt: head_commit.timestamp
    }

    await Commits.create(commit)
    res.sendStatus(200)
  } catch (error) {
    res.status(500).send(error.message)
  }
}

module.exports = { list, create }
