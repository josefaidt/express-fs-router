import path from 'path'
import express, { Request, Response } from 'express'
import FSRouter from 'express-fs-router'
const app = express()

const PORT: number = parseFloat(process.env.PORT) || 3000

// https://expressjs.com/en/api.html#req.body
app.use(express.json()) // for parsing application/json

// set up file-system router
app.use('/', new FSRouter(path.join(__dirname, 'api')))
// listen for connections
app.listen(PORT, () => console.info(`Listening at http://localhost:${PORT}`))
