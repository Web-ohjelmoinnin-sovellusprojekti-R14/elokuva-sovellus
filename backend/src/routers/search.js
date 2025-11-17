const express = require("express");
const router = express.Router();
const { searchMovies } = require("../tmdbClient");

router.get("/search", async (req, res) => {
    try {
        const q = req.query.q;
        const page = req.query.page || 1;

        if (!q) return res.status(400).json({error: "Missing query param q"});
        const data = await searchMovies(q, page);
        res.json(data);
    }
    catch (err) {
        console.error("Error searching movies:", err.message || err);
        res.status(500).json({error: "Failed to search movies"});
    }
});

module.exports = router;