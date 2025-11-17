const axios = require("axios");

const apiKey = process.env.OMDB_API_KEY;
const baseURL = process.env.OMDB_BASE_URL || "http://www.omdbapi.com/";

const omdb = axios.create({
  baseURL,
  params: { apikey: apiKey }
});

async function searchDetails(i) {
    const res = await omdb.get("/", {
        params: { i }
    });
    return res.data;
}

module.exports = {
    searchDetails
}