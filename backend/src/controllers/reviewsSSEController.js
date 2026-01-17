import { getUserReviews, enrichReview } from './reviewService.js'
import { ratingCounter } from './ratingCounter.js'
import pool from '../db.js'
import pLimit from 'p-limit'

export async function getReviewsByUserIdSSE(req, res) {
  const user_id = req.user.user_id
  const language = req.query.language || 'en-US'
  const userRes = await pool.query('SELECT username FROM "User" WHERE user_id = $1', [user_id])
  const username = userRes.rows[0]?.username ?? null
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  if (typeof res.flushHeaders === 'function') res.flushHeaders()

  let closed = false
  req.on('close', () => {
    closed = true
    if (!res.writableEnded) res.end()
  })

  const send = (event, data) => {
    if (closed || res.writableEnded) return
    res.write(`event: ${event}\n`)
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  try {
    const reviews = await getUserReviews(user_id)

    send('total', { total: reviews.length })

    const batchSize = 20
    const concurrency = 10
    const limit = pLimit(concurrency)

    let watchtimeMinutes = 0
    let loaded = 0

    for (let i = 0; i < reviews.length; i += batchSize) {
      if (closed) return

      const chunk = reviews.slice(i, i + batchSize)

      const detailedChunk = await Promise.all(
        chunk.map(review =>
          limit(async () => {
            const detailed = await enrichReview(review, language)

            const runtimeMin = Number(detailed?.details?.runtime)
            if (Number.isFinite(runtimeMin) && runtimeMin > 0) {
              watchtimeMinutes += runtimeMin
            }

            loaded += 1
            return detailed
          })
        )
      )

      send('reviews', detailedChunk)

      const wtHours = Math.trunc((watchtimeMinutes / 60) * 0.9)
      send('progress', {
        username,
        loaded,
        total: reviews.length,
        percent: Math.round((loaded / reviews.length) * 100),
        watchtime: wtHours,
        rating: ratingCounter(wtHours, reviews.length),
      })
    }

    send('complete', true)
    if (!res.writableEnded) res.end()
  } catch (err) {
    console.error(err)
    send('error', 'Failed to stream reviews')
    if (!res.writableEnded) res.end()
  }
}
