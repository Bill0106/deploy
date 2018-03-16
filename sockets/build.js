const fs = require('fs')
const path = require('path')
const child = require('child_process')
const moment = require('moment')
const AU = require('ansi_up')
const Builds = require('../models/Builds')
const Logs = require('../models/Logs')
const ansi_up = new AU.default

module.exports = async (commit, socket) => {
  let contents = ''
  const spawn = child.spawn('bash', ['bash/build.sh', `site-frontend-${commit.repo}`, commit.commit_id])

  spawn.stdout.on('data', data => {
    contents += ansi_up.ansi_to_html(`[${moment().format('HH:mm:ss')}] ${data.toString()}`)
    socket.emit('log', contents)
  })

  // spawn.on('close', async code => {
  //   const log = await Logs.create({ contents: log })

  //   const manifest = path.join(__dirname, '../', 'manifest.json')
  //   const build = await Builds.create({
  //     dist_files: fs.readFileSync(manifest).toString(),
  //     log_id: log._id
  //   })

  //   commit.build_id = build._id
  //   commit.save()

  //   fs.unlinkSync(manifest)
  //   socket.emit('finish', true)
  // })
}
