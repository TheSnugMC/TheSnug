const { io } = require("../app")

const FLOOD_TIMEOUT = 500
const MAX_CHARS = 350

const users = {}
const usedNicks = exports.usedNicks = new Set()
const urlRegex = /(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/

io.on("connection", (socket) => {
  const ip = socket.request.connection.remoteAddress

  socket.on("chat message", (message, cb) => {
    if (!(ip in users)) {
      socket.emit("chat error", "nonick", "You didn't choose a nickname.")
      cb(false)
      return
    }

    if (new Date() - users[ip].lastMessage < FLOOD_TIMEOUT) {
      socket.emit("chat error", "spam", "Please don't spam.")
      cb(false)
      return
    }

    if (urlRegex.test(message)) {
      socket.emit("chat error", "nourls", "URLs in links are disallowed.")
      cb(false)
      return
    }

    if (message.length < 1 || message.length > MAX_CHARS) {
      socket.emit("chat error", "messagelimit",
        `Your message must be between 1 and ${MAX_CHARS} characters long.`)
      cb(false)
      return
    }

    users[ip].lastMessage = new Date()

    const messageData = {
      type: "chat",
      message,
      date: new Date(),
      username: users[ip].nickname,
    }

    socket.broadcast.emit("chat message", messageData)
    socket.emit("chat message", messageData)
    cb(true)
  })

  socket.on("nickname", (nick, cb) => {
    if (usedNicks.has(nick) && !(ip in users)) {
      socket.emit("nick error", "taken", "This nickname is already in use.")
      cb(false)
      return
    }

    if (nick.length < 1 || nick.length > 25) {
      socket.emit("nick error", "limit",
        "Your nickname must be between 1 and 25 characters long.")
      cb(false)
      return
    }

    if (urlRegex.test(nick)) {
      socket.emit("nick error", "nourls", "Your nickname contains a URL.")
      cb(false)
      return
    }

    if (ip in users) {
      usedNicks.delete(users[ip].nickname)
      socket.broadcast.emit("nick change", users[ip].nickname, nick)
    } else {
      socket.broadcast.emit("join", nick)
      socket.emit("join", nick)

      users[ip] = {
        nickname: nick,
        lastMessage: new Date(new Date() - FLOOD_TIMEOUT),
      }
    }
    usedNicks.add(nick)
    cb(true)
  })

  socket.on("disconnect", () => {
    if (ip in users) {
      const user = users[ip]
      delete users[ip]
      usedNicks.delete(user.nickname)
      socket.broadcast.emit("part", user.nickname)
    }
  })

  socket.on("error", (e) => {
    console.error(e)
  })
})
