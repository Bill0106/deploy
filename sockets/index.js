const Commits = require('../models/Commits')
const Builds = require('../models/Builds')
const build = require('./build')
const publish = require('./publish')

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

  socket.on('publish', async data => {
    const { id } = data

    try {
      const build = await Builds.findById(id).exec()
      if (!build) {
        throw new Error('No such build!')
      }

      publish(build, socket)
    } catch (error) {
      socket.emit('error', error.message)
    }
  })
}
