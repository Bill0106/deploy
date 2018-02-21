const express = require('express')
const controllers = require('../controllers')
const router = express.Router()

// router.get('/', controllers.commits)
// router.post('/commits', controllers.webhook)

router.post('/webhook/:repo', controllers.webhook)

module.exports = router
