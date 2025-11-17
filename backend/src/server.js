import dotenv from 'dotenv'
dotenv.config()
import express, { json } from 'express'
import cors from 'cors'

import searchRouter from './routers/search.js'
import nowInCinemaRouter from './routers/nowInCinema.js'
const app = express()

app.use(cors())
app.use(json())

app.use('/api', searchRouter)
app.use('/api', nowInCinemaRouter)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
