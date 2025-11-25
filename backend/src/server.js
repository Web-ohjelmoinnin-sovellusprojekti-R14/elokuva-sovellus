import dotenv from 'dotenv'
dotenv.config()

import express, { json } from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'

import searchRouter from './routers/search.js'
import nowInCinemaRouter from './routers/nowInCinema.js'
import registrationRouter from './routers/registration.js'
import loginRouter from './routers/login.js'
import advancedSearchRouter from './routers/advancedSearch.js'

const app = express()

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
)

app.use(json())

app.use('/api', searchRouter)
app.use('/api', nowInCinemaRouter)
app.use('/api', registrationRouter)
app.use('/api', loginRouter)
app.use('/api', advancedSearchRouter)

app.get('/api/me', (req, res) => {
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({ user: null })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return res.json({
      user: {
        user_id: decoded.user_id,
        username: decoded.username,
      },
    })
  } catch (err) {
    return res.status(401).json({ user: null })
  }
})

app.post('/api/logout', (req, res) => {
  res.clearCookie('token')
  res.status(200).json({ message: 'Logged out' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
