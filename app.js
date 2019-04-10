const path = require("path")
const fs = require("fs")

const crypto = require("crypto")
const express = require("express")
const debug = require("debug")("thesnug:main")
const bodyParser = require("body-parser")
const helmet = require("helmet")
const morgan = require("morgan")
const Sequelize = require("sequelize")
const passport = require("passport")
const session = require("express-session")
const SequelizeStore = require("connect-session-sequelize")(session.Store)
//const { Strategy: JwtStrategy, ExtractJwt: JwtExtractors } = require("passport-jwt")
const { Strategy: LocalStrategy } = require("passport-local")

const app = exports.app = express()
const server = require("http").createServer(app)
const io = exports.io = require("socket.io")(server)

const isDev = process.env.NODE_ENV !== "production"
const config = exports.config =
  JSON.parse(fs.readFileSync(path.join(__dirname, "config.json")))

const sequel = exports.sequel = new Sequelize(
  config.db, config.user, config.pass, {
    host: config.host,
    dialect: "postgres",

    logging: false, //(m) => debug(m),

    operatorsAliases: false,
  },
)

require("./src/models")
require("./src/chat")

sequel.authenticate()
  .then(() => sequel.sync())
  .then(() => debug("Connected to database"))

app.use(morgan("dev"))
app.use(helmet())
app.use(session({
  secret: config.secret,
  resave: false,
  saveUninitialized: false,
  store: new SequelizeStore({
    db: sequel,
  }),
  cookie: {
    secure: !isDev,
  }
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy((username, password, done) => {
  if (config.adminUser !== username)
    return void done(null, false, { message: "Incorrect username." })

  crypto.pbkdf2(password, config.secret, 100000, 64, "sha256", (err, key) => {
    if (err) return void done(err)
    if (key.toString("hex") === config.adminPass)
      done(null, { username, loggedIn: true })
    else
      done(null, false, { message: "Incorrect password." })
  })
}))

passport.serializeUser((user, done) => {
  done(null, user.username)
})

passport.deserializeUser((username, done) => {
  done(null, { username, loggedIn: true })
})


const apiRoutes = require("./src/routes")
app.use("/.api/", apiRoutes)
app.use("/static", express.static(path.resolve(__dirname, "client", "build", "static")))
app.get("/*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
})

if (require.main === module) {
  server.listen(3001, () => {
    debug("Serving at localhost:3001")
  })
}
