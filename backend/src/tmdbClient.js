const axios = require("axios");

const apiKey = process.env.TMDB_API_KEY;
const baseURL = process.env.TMDB_BASE_URL || "https://api.themoviedb.org/3";

const tmdb = axios.create({
  baseURL,
  params: { api_key: apiKey }
});

async function searchMovies(query, page) {
  const res = await tmdb.get("/search/movie", {
    params: { query, page }
  });
  return res.data;
}

async function nowInCinema(page, region) {
  const res = await tmdb.get("/movie/now_playing", {
    params: { page, region }
  });
  return res.data;
}

module.exports = {
  searchMovies,
  nowInCinema
};

