const { sequel } = require("../app")
const { DataTypes } = require("sequelize")

const VIDEO_DURATION_COMMAND = `ffprobe -i <file> -show_entries format=duration -v quiet -of csv="p=0"`

exports.Video = sequel.define("video", {
  title: DataTypes.STRING(160),

  path: DataTypes.TEXT,

  startsAt: DataTypes.DATE,
  endsAt: DataTypes.DATE,

  duration: DataTypes.INTEGER,

  imdbId: DataTypes.STRING(20),
})
