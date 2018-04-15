const Commits = require('../models/Commits')
const build = require('./build')

module.exports = socket => {
  socket.on('build', async data => {
    const { id } = data

    try {
      const commit = await Commits.findById(id).exec()
      if (!commit) {
        throw new Error('No such commit!')
      }

      if (commit.build_id) {
        throw new Error('Commit has builded!')
      }

      build(commit, socket)
    } catch (error) {
      socket.emit('error', error.message)
    }
  })
}
