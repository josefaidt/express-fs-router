const express = require('express')
const FSRouter = require('express-fs-router')
const app = express()

const PORT = process.env.PORT || 3000

// https://expressjs.com/en/api.html#req.body
app.use(express.json()) // for parsing application/json

// set up file-system router
app.use('/', new FSRouter('api'))
// listen for connections
app.listen(PORT, () => console.info(`Listening at http://localhost:${PORT}`))
