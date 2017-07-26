const moment = require('moment')
const Commits = require('../models/Commits')

module.exports = (req, res) => {
  const repo = req.query.repo || 'site-frontend-admin'
  const limit = 30
  const page = Number(req.query.page) || 1
  const offset = limit * (page - 1)

  Commits
    .where({ 'repo': repo, 'ref': 'refs/heads/master' })
    .sort({ committedAt: 'desc' })
    .limit(limit)
    .skip(offset)
    .find()
    .exec()
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
