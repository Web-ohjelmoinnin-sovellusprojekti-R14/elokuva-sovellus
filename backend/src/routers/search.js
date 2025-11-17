const express = require("express");
const router = express.Router();
const { titleSearch, movieDetailsSearch, tvDetailsSearch } = require("../tmdbClient");
const { searchDetails } = require("../omdbClient");

router.get("/titlesearch", async (req, res) => {
  const q = req.query.q;
  if (!q) {
    return res.status(400).json({ error: "Missing query param q" });
  }

  const data = await titleSearch(q);

  const filteredResults = Array.isArray(data.results)
    ? data.results.filter(item => item.media_type !== "person")
    : [];

  const detailedResults = await Promise.all(filteredResults.map(async (item) => {
    let imdb_id = null;

    if (item.media_type === "movie") {
      const details = await movieDetailsSearch(item.id);
      imdb_id = details.imdb_id;
    } else if (item.media_type === "tv") {
      const details = await tvDetailsSearch(item.id);
      imdb_id = details.external_ids?.imdb_id;
    }

    let imdb_rating = null;
    if (imdb_id) {
      const omdbDetails = await searchDetails(imdb_id);
      imdb_rating = omdbDetails.imdbRating;
    }
    return { ...item, imdb_rating };
  }));

  const filteredData = { ...data, results: detailedResults };
  res.json(filteredData);
});


module.exports = router;