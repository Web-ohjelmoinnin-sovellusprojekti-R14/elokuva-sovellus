import { Router } from 'express';
const router = Router();
import { buildCacheKey, buildCombinedResults } from '../controllers/advancedSearchController.js';

const ITEMS_PER_PAGE = 18;
const BATCH_SIZE = 110;
const cache = {}; 

router.get('/advanced_search', async (req, res) => {
  try {
    const appPage = parseInt(req.query.page, 10) || 1;

    let media_type = null;
    if (req.query.category === 'movies' || req.query.category === 'cartoons') {
      media_type = 'movie';
    } else if (req.query.category === 'series' || req.query.category === 'anime') {
      media_type = 'tv';
    } else if (req.query.media_type) {
      media_type = req.query.media_type;
    }

    let year_min = req.query.year_from || req.query.year_min || null;
    if (year_min && !year_min.includes('-')) {
      year_min = `${year_min}-01-01`;
    }

    let year_max = req.query.year_to || req.query.year_max || null;
    if (year_max && !year_max.includes('-')) {
      year_max = `${year_max}-12-31`;
    }

    const include_adult = req.query.adult === '1' || req.query.include_adult === 'true' || false;

    const baseParams = {
      media_type,
      year_min,
      year_max,
      include_adult,
      with_genres: req.query.with_genres || null,
      with_origin_country: req.query.with_origin_country || null,
    };

    const batchNum = Math.ceil((appPage * ITEMS_PER_PAGE) / BATCH_SIZE);
    const cacheKey = `${buildCacheKey(baseParams)}:batch${batchNum}`;

    if (!cache[cacheKey]) {
      //console.log('Building batch', batchNum, 'with params:', baseParams);
      const results = await buildCombinedResults({ ...baseParams, batchNum });

      cache[cacheKey] = {
        results,
        hasMore: results.length >= BATCH_SIZE,
      };
    }

    const { results, hasMore } = cache[cacheKey];

    const start = (appPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const pageResults = results.slice(start, end);

    res.json({
      results: pageResults,
      hasMore: hasMore && pageResults.length === ITEMS_PER_PAGE,
    });

  } catch (err) {
    console.error('Error /advanced_search:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
