#!/usr/bin/env node

if (process.argv.length !== 6) {
  console.log("Usage:", process.argv[1], "<title> <imdb ID> <video URL> <duration in seconds>")
  process.exit(1)
}

const { Video } = require("../src/models")
const moment = require("moment")

const [ title, imdbId, path, duration ] = process.argv.slice(2)

Video.findOne({
  order: [["endsAt", "DESC"]],
}).then(video => {
  const startsAt = video === null
    ? moment()
    : (moment(video.endsAt).diff(moment()) < 0
      ? moment()
      : moment(video.endsAt)
    )
  const endsAt = startsAt.clone().add(parseInt(duration), "seconds")

  return Video.create({
    title, path, imdbId, startsAt, endsAt, duration: parseInt(duration)
  })
}).then(newVid => {
  if (newVid.title === title) {
    console.log(`${title} queued at ${moment(newVid.startsAt).format("HH:mm")}.`)
    process.exit(0)
  } else {
    console.warn("Huh, the title doesn't match.")
  }
}).catch(err => {
  console.error("The movie could not be queued.")
  console.error(err)
})
