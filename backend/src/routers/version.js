import express from "express"
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 30 * 1000,
  max: 25,
  message: { error: 'Too much requests' },
})

const router = express.Router()

router.get("/", limiter, async (req, res) => {
    res.json({
        requiredBuild: Number(process.env.REQUIRED_BUILD)
    })
})

export default router