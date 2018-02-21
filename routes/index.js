const express = require('express')
const controllers = require('../controllers')
const router = express.Router()

router.get('/commits', controllers.commits)
router.post('/webhook/:repo', controllers.webhook)

module.exports = router
