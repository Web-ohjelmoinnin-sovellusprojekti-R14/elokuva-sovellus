import dotenv from 'dotenv'
dotenv.config()
import express, { json } from 'express'
import cors from 'cors'

import searchRouter from './routers/search.js'
import nowInCinemaRouter from './routers/nowInCinema.js'
import registrationRouter from './routers/registration.js'
import loginRouter from './routers/login.js'
const app = express()

app.use(cors())
app.use(json())

app.use('/api', searchRouter)
app.use('/api', nowInCinemaRouter)
app.use('/api', registrationRouter)
app.use('/api', loginRouter)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
