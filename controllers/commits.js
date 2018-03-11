const Commits = require('../models/Commits')

module.exports = async (req, res) => {
  const { repo, limit, offset } = req.query

  try {
    if (!['app', 'admin'].includes(repo)) {
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
