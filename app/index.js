const express = require('express')
const controllers = require('./controllers')
const router = express.Router()

router.route('/commits')
  .get(controllers.index)
  .post(controllers.webhook)

module.exports = router
