const path = require('path')
const express = require('express')
const { commits, logs } = require('../controllers')
const router = express.Router()

router.get('/', (req, res) => res.sendFile(path.resolve(__dirname, '../public', 'index.html')))
router.get('/commits', commits.list)
router.post('/webhook/:repo', commits.create)
router.get('/builds/:id/log', logs.findByBuildId)

module.exports = router
