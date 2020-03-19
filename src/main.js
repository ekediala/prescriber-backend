require("./database/index.database");
require("./jobs/reminder.cron");

const { NODE_ENVIRONS, PORT } = require("./constants/index.constants");

const HomeController = require("./controllers/home.controller");
const express = require("express");
const router = require("./routes");
const cors = require('cors');

const { DEVELOPMENT, PRODUCTION, ENV } = NODE_ENVIRONS;

const app = express();
app.use(cors());

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "*");
//   res.header("Access-Control-Allow-Headers", "*");
//   next();
// });

app.use(express.json());
app.use("/v1", router);

app.get("/*", HomeController.invalid);

app.listen(process.env.PORT || PORT, () => {
  ENV === DEVELOPMENT
    ? console.log(`${DEVELOPMENT} server running at port ${PORT}`)
    : console.log(`${PRODUCTION} server running at port ${process.env.PORT}`);
}); 

module.exports = app;
