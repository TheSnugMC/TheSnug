const router = require("express").Router()

const fs = require("fs")
const path = require("path")
const { Video } = require("./models")
const { Op } = require("sequelize")
const { io, config } = require("../app")
const { usedNicks } = require("./chat")
const imdb = require("imdb-api")
const moment = require("moment")
const btoa = require("btoa")
const passport = require("passport")
const { ensureLoggedIn } = require("connect-ensure-login")
const child_process = require("child_process")

const checkAuth = ensureLoggedIn("/admin/")

const currentIMDBInfo = {
  id: null,
  data: null,
}

const getCurrentVideo = () => {
  const now = new Date()
  return Video.findOne({ where: {
    [Op.and]: {
      startsAt: { [Op.lte]: now },
      endsAt: { [Op.gt]: now },
    }
  } })
}

router.route("/stream")
  .get((req, res) => {
    getCurrentVideo().then((video) => {
      if (video === null) {
        res.json(null)
        return
      }

      const { title, path, startsAt, endsAt, duration, imdbId } = video

      res.json({
        title, path, startsAt, endsAt, duration, imdbId,
        viewers: io.engine.clientsCount
      })
    })
  })

router.get("/roster", (req, res) => res.json(Array.from(usedNicks)))

router.get("/imdb", (req, res) => {
  getCurrentVideo().then((video) => {
    if (video === null) {
      return void res.json(null)
    }

    const { imdbId } = video
    if (!imdbId) {
      return void res.json(null)
    }

    if (imdbId === currentIMDBInfo.id) {
      return void res.json(currentIMDBInfo.data)
    } else {
      // attempt to fetch the imdb information
      return imdb.get({ id: imdbId }, { apiKey: config.omdbKey })
    }
  }).then((movie) => {
    // end early, we handled it
    if (movie == null) return

    const { imdbid, title, year, poster, plot } = movie
    currentIMDBInfo.data = { title, year, poster, plot }
    currentIMDBInfo.id = imdbid
    res.json(currentIMDBInfo.data)
  }).catch(err => {
    console.error("Couldn't fetch the current IMDB data.", err.toString())
    res.json(null)
  })
})

router.route("/schedule")
  .get((req, res) => {
    const startOfMonth = moment().startOf("month")

    Video.findAll({
      where: { endsAt: { [Op.gt]: startOfMonth } }
    }).then(res.json.bind(res))
      .catch(() => res.json(null))
  })

router.get("/pages/:pageId", (req, res) => {
  fs.readFile(
    path.resolve(__dirname, "..", "pages", `${req.params.pageId}.md`),
    (err, data) => {
      // TODO more granular
      if (err) {
        console.error(err)
        return void res.status(404).json({
          error: "Page not found.",
        })
      }

      res.type(".txt").send(data)
    })
})

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return void next(err)
    if (!user) {
      return void res.status(401).json({
        error: info.message,
      })
    }

    req.logIn(user, (err) => {
      if (err) return void next(err)
      res.json(user)
    })
  })(req, res, next)
})

router.route("/movies")
  .all(checkAuth)
  .get((req, res) => {
    Video.findAll()
      .then(videos => res.json(videos))
      .catch((err) => {
        console.error(err)
        res.status(500).json({
          error: "An internal server error occured.",
        })
      })
  })
  .post((req, res) => {
    const { movie } = req.body

    if (movie["id"]) {
      delete movie["id"]
    }

    Video.create(movie)
      .then((newMovie) => {
        res.status(201).json(newMovie)
      })
      .catch((err) => {
        console.error(err)
        res.status(500).json({
          error: "An internal server error occured.",
        })
      })
  })

router.route("/movie/:id")
  .all(checkAuth)
  .get((req, res) => {
    Video.findById(req.params.id)
      .then((video) => {
        if (video === null) {
          return void res.status(404).json({
            error: "The specified movie does not exist.",
          })
        }

        res.json(video)
      })
      .catch((err) => {
        console.error(err)
        res.status(500).json({
          error: "An internal server error occured.",
        })
      })
  })
  .put((req, res) => {
    const { movie } = req.body
    delete movie["id"]

    Video.update(movie, { where: { id: req.params.id } })
      .then(() => {
        res.json(movie)
      })
      .catch((err) => {
        console.error(err)
        res.status(500).json({
          error: "An internal server error occured.",
        })
      })
  })
  .delete((req, res) => {
    Video.destroy({ where: { id: req.params.id } })
      .then((count) => {
        if (count > 0) {
          return void res.json({
            success: true,
          })
        }

        res.status(400).json({
          error: "No movie with that ID exists.",
        })
      })
      .catch((err) => {
        console.error(err)
        res.status(500).json({
          error: "An internal server error occured.",
        })
      })
  })

router.post("/fetch/imdb", checkAuth, (req, res) => {
  imdb.search({ name: req.body.title }, { apiKey: config.omdbKey })
    .then(({ results: [result], totalresults }) => {
      if (totalresults < 1) {
        return void res.status(404).json({
          error: "No results found.",
        })
      }

      const { imdbid } = result
      return imdb.get({ id: imdbid }, { apiKey: config.omdbKey })
    }).then((movie) => {
      // End early
      if (movie == null) return

      const { imdbid, title, runtime } = movie
      res.status(200).json({
        title,
        runtime: parseInt(runtime),
        id: imdbid,
      })
    }).catch((err) => {
      console.log(err)
      res.status(500).json({
        error: "An internal server error occured.",
      })
    })
})

const ffprobeParams = [
  "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration",
  "-of", "default=noprint_wrappers=1:nokey=1",
]
router.post("/fetch/ffmpeg", checkAuth, (req, res) => {
  const { path } = req.body
  const proc = child_process.spawn("ffprobe", ffprobeParams.concat(path))
  let data = ""

  proc.stdout.on("data", (d) => {
    data += parseInt(d)
  })
  proc.on("close", (code) => {
    if (code === 0) {
      const duration = parseFloat(data.trim()) / 60
      res.status(200).json({
        duration: `${Math.floor(duration)}:${Math.ceil((duration % 1) * 60)}`,
      })
    } else {
      res.status(400).json({
        error: "An incorrect URL was provided.",
      })
    }
  })
})

module.exports = router
