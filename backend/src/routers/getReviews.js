import { Router } from 'express';
import { getReviewsByUserIdController, getReviewsByMovieIdController } from '../controllers/getReviewsController.js';
import { authMe } from '../controllers/authMeController.js';

const router = Router();

router.get('/get_reviews_by_user_id', authMe, async (req, res) => { 
  try {
    const user_id = req.user.user_id;
    const response = await getReviewsByUserIdController(user_id);
    return res.status(201).json(response);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get reviews by User ID' });
  }
});

router.get('/get_reviews_by_movie_id', async (req, res) => {
  try {
    const movie_id = req.query.movie_id;
    const media_type = req.query.media_type;
    const response = await getReviewsByMovieIdController(movie_id, media_type);
    return res.status(201).json(response);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get reviews by Movie ID' });
  }
});

export default router;
