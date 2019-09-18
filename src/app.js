const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(cors())

module.exports = app