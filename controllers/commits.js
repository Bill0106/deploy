const moment = require('moment')
const Commits = require('../models/Commits')

module.exports = async (req, res) => {
  const limit = 30
  const { repo } = req.query
  const page = Number(req.query.page) || 1
  const offset = limit * (page - 1)

  try {
    if (!['app', 'admin'].includes(repo)) {
      throw new Error('No such repository')
    }

    const commits = await Commits.where({ 'repo': repo, 'ref': 'refs/heads/master' })
      .sort({ committedAt: 'desc' })
      .limit(limit)
      .skip(offset)
      .find()
      .exec()

    res.status(200).send(commits)
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
}
