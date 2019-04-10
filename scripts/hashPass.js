#!/usr/bin/env node

const crypto = require("crypto")
const fs = require("fs")
const path = require("path")

const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "config.json")))

crypto.pbkdf2(process.argv[2], config.secret, 100000, 64, "sha256", (err, key) => {
  if (err) throw err
  console.log("The password hash is:")
  console.log(key.toString("hex"))
})
