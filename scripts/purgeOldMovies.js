#!/usr/bin/env node
const { Video } = require("../src/models")
const { Op } = require("sequelize")
const moment = require("moment")

const today = moment().startOf("day")

Video.destroy({
  where: {
    endsAt: {
      [Op.lt]: today
    }
  }
}).then((destroyed) => {
  console.log(`${destroyed} movies were deleted.`)
}).catch((err) => {
  console.error("An error occured.")
  console.error(err)
}).finally(() => {
  process.exit(0)
})
