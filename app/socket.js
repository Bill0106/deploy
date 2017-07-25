const child = require('child_process')
const socketIO = require('socket.io')
const Commits = require('./models/CommitsModel')
const Logs = require('./models/LogsModel')

const socket = (server) => {
  const io = socketIO(server)

  io.on('connection', (socket) => {
    socket.on('build', (data) => {
      const { id } = data
      console.log(id)
      Commits.findById(id, (err, res) => {
        if (err) {
          socket.emit('error', err.message)
        }

        console.log(res.repo)
        socket.emit('log', 'start building...')
        const spawn = child.spawn('bash', ['/var/www/build.sh', res.repo, res.commit_id])
        spawn.stdout.on('data', (data) => {
          console.log(data)
          socket.emit('log', data.toString())
        })
        spawn.stderr.on('data', (data) => socket.emit('error', data.toString()))
      })
    })
  })

  return io
}

module.exports = socket
