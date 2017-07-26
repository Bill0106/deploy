const fs = require('fs')
const path = require('path')
const child = require('child_process')
const cheerio = require('cheerio')

module.exports = (commit, socket) => {
  const files = JSON.parse(commit.dist_files)
  const html = fs.readFileSync(path.resolve(__dirname, '../views', 'index.html.example'))
  const $ = cheerio.load(html)

  socket.emit('log', "Generate index.html file... \n")
  const title = commit.repo === 'site-frontend-admin' ? 'Admin' : `Bill's Hobby | Write as a Interest`
  const element = commit.repo === 'site-frontend-admin' ? $("<main/>").attr('id', 'admin') : $("<my-app/>")
  $("title").text(title)
  $("body").html(element)
  Object.keys(files).forEach(file => {
    const script = $("<script/>").attr('src', `http://7xtddu.com1.z0.glb.clouddn.com/${files[file]}`)
    $("body").append(script)
  })

  fs.writeFileSync(path.resolve(__dirname, '../views', 'index.html'), $.html())

  socket.emit('log', "Deploy index.html file... \n")
  const dir = commit.repo === 'site-frontend-admin' ? 'admin' : 'app'
  const spawn = child.spawn('bash', ['/var/www/publish.sh', dir])

  commit.published = true
  commit.save()
  socket.emit('finish', true)
}
