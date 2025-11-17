const express = require("express");
const router = express.Router();
const { nowInCinema } = require("../tmdbClient");

router.get("/now_in_cinema", async (req, res) => {
    try {
        const page = req.query.page || 1;
        const region = req.query.region || "FI";

        const data = await nowInCinema(page, region);
        res.json(data);
    }
    catch (err) {
        console.error("Error getting now playing movies:", err.message || err);
        res.status(500).json({error: "Failed to get now playing movies"});
    }
    
});

module.exports = router;