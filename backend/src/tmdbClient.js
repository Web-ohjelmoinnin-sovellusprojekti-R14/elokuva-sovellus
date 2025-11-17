const axios = require("axios");

const apiKey = process.env.TMDB_API_KEY;
const baseURL = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";

const tmdb = axios.create({
  baseURL,
  params: { api_key: apiKey }
});

async function nowInCinema(page, region) {
  const res = await tmdb.get("/movie/now_playing", {
    params: { page, region }
  });
  return res.data;
}

async function titleSearch(query) {
    const res = await tmdb.get("/search/multi", {
        params: { query }
    });
    return res.data;
}

async function movieDetailsSearch(movie_id) {
    const res = await tmdb.get("/movie/" + movie_id)
    return res.data;
}

async function tvDetailsSearch(series_id) {
  const detailsRes = await tmdb.get("/tv/" + series_id);
  const details = detailsRes.data;
  const idsRes = await tmdb.get(`/tv/${series_id}/external_ids`);
  const external_ids = idsRes.data;
  return { ...details, external_ids };
}

module.exports = {
  nowInCinema,
  titleSearch,
  movieDetailsSearch,
  tvDetailsSearch
};

