const fs = require('fs')
const path = require('path')
const child = require('child_process')
const cheerio = require('cheerio')
const Commits = require('../models/Commits')
const Builds = require('../models/Builds')

/**
 * Make index.html file contents
 * @param  {object} commit
 *
 * @returns {string}
 */
function makeIndexFile(commit) {
  const files = commit.build_id.dist_files.split(',')
  const html = fs.readFileSync(path.resolve(__dirname, '../public', 'index.html.example'))
  const $ = cheerio.load(html)

  const title = commit.repo === 'admin' ? 'Admin' : `Bill's Hobby`
  const element = commit.repo === 'admin' ? $("<main/>").attr('id', 'admin') : $("<my-app/>")
  $("title").text(title)
  $("body").html(element)

  files.forEach(file => {
    const script = $("<script/>").attr('src', `http://7xtddu.com1.z0.glb.clouddn.com/${file}`)
    $("body").append(script)
  })

  return $.html()
}

/**
 * Run publish.sh write html to index.html
 * @param  {string} repo
 * @param  {string} html
 *
 * @returns {promise}
 */
function runPublish(repo, html) {
  return new Promise((resolve, reject) => {
    child.exec(`bash bash/publish.sh ${repo} '${html}'`, async (err, stdout, stderr) => {
      if (err) reject(err)

      resolve()
    })
  })
}

module.exports = async (req, res) => {
  const { id } = req.params

  try {
    const commit = await Commits.findById(id).populate('build_id').exec()
    const build = commit.build_id
    if (!commit) {
      throw new Error('Commit not found!')
    } else if (!build) {
      throw new Error('Commit is not build!')
    }

    const publishedCommit = await Commits.find({ repo: commit.repo, build_id: { $ne: null } }).exec()
    const publishedCommitIds = publishedCommit.map(item => item.build_id).filter(item => item)
    const publishedBuild = await Builds.findOne({ _id: { $in: publishedCommitIds }, published: true }).exec()
    if (publishedBuild && build === publishedBuild._id) {
      throw new Error('Commit is published!')
    }

    const html = makeIndexFile(commit)
    await runPublish(commit.repo, html)

    build.published = true
    build.publishedAt = new Date()
    await build.save()

    if (publishedBuild) {
      publishedBuild.published = false
      await publishedBuild.save()
    }

    res.sendStatus(200)
  } catch (error) {
    console.error(error.message)
    res.status(500).send(error.message)
  }
}
