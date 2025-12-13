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
import deleteReviewRouter from './routers/deleteReview.js'
import createGroupRouter from './routers/createGroup.js'
import deleteGroupRouter from './routers/deleteGroup.js'
import getGroupDetails from './routers/getGroupDetails.js'
import editGroupRouter from './routers/editGroup.js'
import sendInvitationRouter from './routers/sendInvitation.js'
import getUserInvitationsRouter from './routers/getUserInvitations.js'
import acceptInvitationRouter from './routers/acceptInvitation.js'
import rejectInvitationRouter from './routers/rejectInvitation.js'
import getUserGroupsRouter from './routers/getUserGroups.js'
import removeMemberRouter from './routers/removeMember.js'
import cookieParser from 'cookie-parser'
import removeFilmRouter from './routers/removeFilm.js'
import addFilmRouter from './routers/addFilm.js'
import getGroupFilmsRouter from './routers/getGroupFilms.js'

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
app.use('/api', getReviewsRouter)
app.use('/api', saveReviewRouter)
app.use('/api', deleteReviewRouter)
app.use('/api', createGroupRouter)
app.use('/api', logoutRouter)
app.use('/api', authMeRouter)
app.use('/api', deleteGroupRouter)
app.use('/api', getGroupDetails)
app.use('/api', editGroupRouter)
app.use('/api', sendInvitationRouter)
app.use('/api', getUserInvitationsRouter)
app.use('/api', acceptInvitationRouter)
app.use('/api', rejectInvitationRouter)
app.use('/api', getUserGroupsRouter)
app.use('/api', removeMemberRouter)
app.use('/api', addFilmRouter)
app.use('/api', removeFilmRouter)
app.use('/api', getGroupFilmsRouter)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
