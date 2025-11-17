require('dotenv').config();

const express = require("express")
const cors = require("cors");

const searchRouter = require("./routers/search.js");
const nowInCinemaRouter = require("./routers/now_in_cinema.js");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", searchRouter);
app.use("/api", nowInCinemaRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
