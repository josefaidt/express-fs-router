const express = require('express')
const FSRouter = require('express-fs-router')
const app = express()

// https://expressjs.com/en/api.html#req.body
app.use(express.json()) // for parsing application/json

// set up file-system router
app.use('/', new FSRouter('api'))
// listen for connections
app.listen(3000, () => console.info('Listening at http://localhost:3000'))
