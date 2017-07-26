const Commits = require('../models/Commits')
const Logs = require('../models/Logs')
const build = require('./build')
const publish = require('./publish')

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
                socket.emit('err', 'No such commit!')
                return false
              }

              build(commit, socket)
            })
        }
      })
      .catch(err => socket.emit('err', err.message))
  })

  socket.on('publish', data => {
    const { id } = data

    Commits.findById(id).exec()
      .then(res => {
        if (!res) {
          socket.emit('err', 'No such commit!')
          return false
        }

        publish(res, socket)
      })
      .catch(err => socket.emit('err', err.message))
  })
}
