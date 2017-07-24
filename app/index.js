const express = require('express')
const controllers = require('./controllers')
const router = express.Router()

router.route('/').get((req, res) => res.redirect('/commits'))

router.route('/commits')
  .get(controllers.index)
  .post(controllers.webhook)

module.exports = router
