#!/usr/bin/env node

const { Video } = require("../src/models")

Video.destroy({ truncate: true })
  .then(() => {
    console.log("Movie queue cleared.")
    process.exit()
  })
  .catch(err => {
    console.error("Couldn't clear the movie queue.")
    console.error(err)
  })
