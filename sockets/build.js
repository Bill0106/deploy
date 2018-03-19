const fs = require('fs')
const path = require('path')
const child = require('child_process')
const { Duplex } = require('stream')
const moment = require('moment')
const AU = require('ansi_up')
const rimraf = require('rimraf')
const qiniu = require('qiniu')
const Builds = require('../models/Builds')
const Logs = require('../models/Logs')
const { QINIU } = require('../config/token')

const ansi_up = new AU.default
let contents = '', uploadToken, webSocket

/**
 * Concat log contents string and emit with websocket
 * @param  {string} log
 */
function emitLogs(log) {
  contents += ansi_up.ansi_to_html(`[${moment().format('HH:mm:ss')}] ${log}`)
  webSocket.emit('log', contents)
}

/**
 * Run build shell
 * @param  {object} commit
 *
 * @returns {Promise}
 */
function buildCommit(commit) {
  const spawn = child.spawn('bash', ['bash/build.sh', `site-frontend-${commit.repo}`, commit.commit_id])

  spawn.stdout.on('data', data => emitLogs(data.toString()))

  return new Promise((resolve, reject) => {
    spawn.on('close', () => resolve())
    spawn.on('error', err => reject(err))
  })
}

/**
 * Upload file to Qiniu CDN
 * @param  {string} fileName
 *
 * @returns {Promise}
 */
function uploadFile(fileName) {
  const file = fs.readFileSync(path.join('dist', fileName))
  const fileBuffer = new Buffer(file, 'base64')
  const readableStream = new Duplex()
  readableStream.push(fileBuffer)
  readableStream.push(null)

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
    formUploader.putStream(uploadToken, fileName, readableStream, putExtra, (respErr, respBody, respInfo) => {
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
    await buildCommit(commit)

    const dist = path.join(__dirname, '../', 'dist')
    const manifest = fs.readFileSync(path.join(dist, 'manifest.json')).toString()
    const files = JSON.parse(manifest)
    const uploadFiles = Object.keys(files).map(item => uploadFile(files[item]))

    emitLogs('Uploading file to CDN\n')
    await Promise.all(uploadFiles)
    emitLogs('File Uploaded\n')

    emitLogs('Saving data to database\n')
    const dist_files = Object.keys(files).map(item => files[item])
    const build = await Builds.create({ dist_files })
    commit.build_id = build._id
    await commit.save()
    emitLogs('Finished: Success\n')

    const log = await Logs.create({ contents })
    build.log_id = log._id
    await build.save()

    rimraf(dist, err => {
      if (err) throw err

      socket.emit('finish', true)
    })
  } catch (error) {
    socket.emit('err', error.message)
  }
}
