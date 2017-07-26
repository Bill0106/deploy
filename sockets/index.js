const Commits = require('../models/Commits')
const Logs = require('../models/Logs')
const build = require('./build')

module.exports = socket => {
  socket.on('build', data => {
    const { id } = data

    Logs.findOne({ commit_id: id }).exec()
      .then(res => {
        if (res) {
          socket.emit('log', res.log)
          return false
        } else {
          Commits.findById(id).exec()
            .then(commit => {
              if (!commit) {
                socket.emit('buildError', 'No such commit!')
                return false
              }

              build(commit, socket)
            })
        }
      })
      .catch(err => socket.emit('buildError', err.message))
  })
}
