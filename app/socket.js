const child = require('child_process')
const socketIO = require('socket.io')
const AU = require('ansi_up')
const Commits = require('./models/CommitsModel')
const Logs = require('./models/LogsModel')
const ansi_up = new AU.default

const socket = server => {
  const io = socketIO(server)

  io.on('connection', (socket) => {
    socket.on('build', (data) => {
      const { id } = data

      Logs.findOne({ commit_id: id }).exec()
        .then(res => {
          if (res) {
            socket.emit('log', res.log)
            return false
          } else {
            return Commits.findById(id).exec()
          }
        })
        .then(commit => {
          if (!commit) {
            return false
          }

          let log = ''
          socket.emit('log', log)
          const spawn = child.spawn('bash', ['/var/www/build.sh', commit.repo, commit.commit_id])
          spawn.stdout.on('data', data => {
            log += ansi_up.ansi_to_html(data.toString())
            socket.emit('log', log)
          })
          spawn.on('close', code => {
            Logs.create({ commit_id: commit._id, log })
          })
        })
        .catch(err => console.log(err))
    })
  })

  return io
}

module.exports = socket
