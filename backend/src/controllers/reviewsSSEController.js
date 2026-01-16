import { getUserReviews, enrichReview } from './reviewService.js'
import pLimit from 'p-limit'

export async function getReviewsByUserIdSSE(req, res) {
  const user_id = req.user.user_id
  const language = req.query.language || 'en-US'

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const send = (event, data) => {
    res.write(`event: ${event}\n`)
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  try {
    const reviews = await getUserReviews(user_id)
    send('total', { total: reviews.length })

    const batchSize = 20
    const concurrency = 10
    const limit = pLimit(concurrency)
    let watchtime = 0
    let loaded = 0
    let batch = []

    const tasks = reviews.map(review =>
      limit(async () => {
        const detailed = await enrichReview(review, language)
        batch.push(detailed)
        loaded++
        if (detailed.details.runtime) {
          watchtime += detailed.details.runtime
        }
        if (batch.length >= batchSize) {
          send('reviews', batch)
          send('progress', {
            loaded,
            total: reviews.length,
            percent: Math.round((loaded / reviews.length) * 100),
            watchtime: Math.trunc(watchtime / 60),
          })
          batch = []
        }
      })
    )

    await Promise.all(tasks)

    if (batch.length > 0) {
      send('reviews', batch)
      send('progress', {
        loaded,
        total: reviews.length,
        percent: Math.round((loaded / reviews.length) * 100),
        watchtime: Math.trunc(watchtime / 60),
      })
    }

    send('complete', true)
    res.end()
  } catch (err) {
    console.error(err)
    send('error', 'Failed to stream reviews')
    res.end()
  }

  req.on('close', () => res.end())
}
