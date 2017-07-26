const fs = require('fs')
const path = require('path')
const child = require('child_process')
const AU = require('ansi_up')
const Logs = require('../models/Logs')
const ansi_up = new AU.default

module.exports = (commit, socket) => {
  let log = ''
  const spawn = child.spawn('bash', ['/var/www/build.sh', commit.repo, commit.commit_id])

  spawn.stdout.on('data', data => {
    log += ansi_up.ansi_to_html(data.toString())
    socket.emit('log', log)
  })

  spawn.on('close', code => {
    Logs.create({ commit_id: commit._id, log })

    const manifest = path.join(__dirname, '../', 'manifest.json')
    commit.dist_files = fs.readFileSync(manifest).toString()
    commit.save()
    fs.unlinkSync(manifest)
    socket.emit('finish', true)
  })
}
