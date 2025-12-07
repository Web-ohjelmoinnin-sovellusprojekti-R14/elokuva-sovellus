import { discoverMovies, discoverTvSeries } from '../tmdbClient.js';
import { getMovieImdbRating, getTvSeriesImdbRating } from './imdbRatingController.js';

const MAX_TMDB_PAGES = 6;
const MAX_ITEMS = 110;
const cache = new Map(); 

function buildCacheKey(params) {
  const sortedKeys = Object.keys(params).sort();
  const keyObj = {};
  for (const k of sortedKeys) keyObj[k] = params[k];
  return JSON.stringify(keyObj);
}

async function enrichItems(items, expectedType) {
  const tasks = items.map(async (item) => {
    try {
      if (expectedType === 'movie' || item.media_type === 'movie') {
        const rated = await getMovieImdbRating(item);
        return rated ? { ...rated, media_type: 'movie' } : null;
      } else {
        const rated = await getTvSeriesImdbRating(item);
        return rated ? { ...rated, media_type: 'tv' } : null;
      }
    } catch (err) {
      console.error('Error enriching item:', item.id, err.message);
      return null;
    }
  });

  const enriched = await Promise.all(tasks);
  return enriched
    .filter(item => item !== null && item.imdb_rating && parseFloat(item.imdb_rating) >= 5.0)
    .sort((a, b) => parseFloat(b.imdb_rating) - parseFloat(a.imdb_rating));
}

async function buildCombinedResults(params) {
  const { batchNum = 1, media_type, year_min, year_max, include_adult, with_genres, with_origin_country } = params;

  const startTmdbPage = (batchNum - 1) * 6 + 1;
  const endTmdbPage = startTmdbPage + 5;

  const results = [];

  const shouldSearchMovies = params.media_type === 'movie';
  const shouldSearchTv     = params.media_type === 'tv';

  for (let page = startTmdbPage; page <= endTmdbPage && results.length < 110; page++) {
    const promises = [];

    if (shouldSearchMovies) {
      promises.push(discoverMovies(page, year_min, year_max, include_adult, with_genres, null, null, with_origin_country));
    }
    if (shouldSearchTv) {
      promises.push(discoverTvSeries(page, year_min, year_max, include_adult, with_genres, null, null, with_origin_country));
    }

    const responses = await Promise.all(promises);

    for (const res of responses) {
      if (!res?.results?.length) continue;

      const type = res.results[0].title ? 'movie' : 'tv';
      const enriched = await enrichItems(res.results, type);
      results.push(...enriched);

      if (results.length >= 110) break;
    }
  }

  return results.slice(0, 110);
}

export { buildCacheKey, buildCombinedResults };
