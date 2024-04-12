// add express basic app

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 5005;

// Controllers
const redisController = require("./controllers/redisController");
const syncController = require("./controllers/syncController");

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.use("/redis", redisController);
app.use("/sync", syncController);

app.listen(PORT, () => {
  console.log(`S2S app listening on port ${PORT}!`);
});
