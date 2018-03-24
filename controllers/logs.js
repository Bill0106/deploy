const Logs = require('../models/Logs')

const findByBuildId = async (req, res) => {
  const { id } = req.params

  try {
    const log = await Logs.findOne({ build_id: id }).exec()
    res.status(200).send(log)
  } catch (error) {
    console.error(error)
    res.sendStatus(500)
  }
}

module.exports = { findByBuildId }
