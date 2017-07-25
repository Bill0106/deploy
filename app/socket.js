const child = require('child_process')
const socketIO = require('socket.io')
const AU = require('ansi_up')
const Commits = require('./models/CommitsModel')
const Logs = require('./models/LogsModel')
const ansi_up = new AU.default

const socket = (server) => {
  const io = socketIO(server)

  io.on('connection', (socket) => {
    socket.on('build', (data) => {
      const { id } = data
      Commits.findById(id, (err, res) => {
        if (err) {
          socket.emit('error', err.message)
        }

        socket.emit('log', 'start building...')
        const spawn = child.spawn('bash', ['/var/www/build.sh', res.repo, res.commit_id])
        spawn.stdout.on('data', (data) => {
          socket.emit('log', ansi_up.ansi_to_html(data.toString()))
        })
      })
    })
  })

  return io
}

module.exports = socket
