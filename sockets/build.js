const fs = require('fs')
const path = require('path')
const child = require('child_process')
const { Duplex } = require('stream')
const moment = require('moment')
const AU = require('ansi_up')
const qiniu = require('qiniu')
const Builds = require('../models/Builds')
const Logs = require('../models/Logs')
const { QINIU } = require('../config/token')

const ansi_up = new AU.default
let contents = '', uploadToken, webSocket

function emitLogs(log) {
  contents += ansi_up.ansi_to_html(`[${moment().format('HH:mm:ss')}] ${log}`)
  webSocket.emit('log', contents)
}

function build(commit) {
  const spawn = child.spawn('bash', ['bash/build.sh', `site-frontend-${commit.repo}`, commit.commit_id])

  spawn.stdout.on('data', data => emitLogs(data.toString()))

  return new Promise((resolve, reject) => {
    spawn.on('close', () => resolve())
    spawn.on('error', err => reject(err))
  })
}

function uploadFile(fileName, file) {
  if (!uploadToken) {
    const mac = new qiniu.auth.digest.Mac(QINIU.AK, QINIU.SK)
    const putPolicy = new qiniu.rs.PutPolicy({ scope: 'website' })
    uploadToken = putPolicy.uploadToken(mac)
  }

  const config = new qiniu.conf.Config()
  config.zone = qiniu.zone.Zone_z0

  const putExtra = new qiniu.form_up.PutExtra()
  const formUploader = new qiniu.form_up.FormUploader(config)

  return new Promise((resolve, reject) => {
    formUploader.putStream(uploadToken, fileName, file, putExtra, (respErr, respBody, respInfo) => {
      if (respErr) reject(respErr)
      resolve({
        statusCode: respInfo.statusCode,
        body: respBody
      })
    })
  })
}

module.exports = async (commit, socket) => {
  webSocket = socket

  try {
    await build(commit)

    const dist = path.join(__dirname, '../', 'dist')
    const manifest = fs.readFileSync(path.join(dist, 'manifest.json')).toString()
    const files = JSON.parse(manifest)
    const uploadFiles = Object.keys(files).map(item => {
      const fileName = files[item]
      const file = fs.readFileSync(path.join(dist, fileName))
      const fileBuffer = new Buffer(file, 'base64')
      const readableStream = new Duplex()
      readableStream.push(fileBuffer)
      readableStream.push(null)

      return uploadFile(fileName, readableStream)
    })

    emitLogs('Uploading file to CDN\n')
    await Promise.all(uploadFiles)
    emitLogs('File Uploaded\n')
  } catch (error) {
    socket.emit('error', error.message)
  }

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
