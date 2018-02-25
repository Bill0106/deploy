const path = require('path')
const express = require('express')
const controllers = require('../controllers')
const router = express.Router()

router.get('/', (req, res) => res.sendFile(path.resolve(__dirname, '../public', 'index.html')))
router.get('/commits', controllers.commits)
router.post('/webhook/:repo', controllers.webhook)

module.exports = router
