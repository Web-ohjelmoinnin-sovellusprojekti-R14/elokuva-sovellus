import dotenv from 'dotenv'
dotenv.config()

import express, { json } from 'express'
import cors from 'cors'

import searchRouter from './routers/search.js'
import nowInCinemaRouter from './routers/nowInCinema.js'
import registrationRouter from './routers/registration.js'
import loginRouter from './routers/login.js'
import categoriesRouter from './routers/categories.js'
import saveReviewRouter from './routers/saveReview.js'
import titleDataRouter from './routers/titleData.js'
import authMeRouter from './routers/authMe.js'
import logoutRouter from './routers/logout.js'
import getReviewsRouter from './routers/getReviews.js'

import cookieParser from 'cookie-parser'

const app = express()

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
)

app.use(json())
app.use(cookieParser())

app.use('/api', searchRouter)
app.use('/api', nowInCinemaRouter)
app.use('/api', registrationRouter)
app.use('/api', loginRouter)
app.use('/api', categoriesRouter)
app.use('/api', titleDataRouter)
app.use('/api', saveReviewRouter)
app.use('/api', authMeRouter)
app.use('/api', logoutRouter)
app.use('/api', getReviewsRouter)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
