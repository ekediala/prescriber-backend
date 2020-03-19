const {
  GENERIC_CONSOLE_MESSAGES,
  MONGO_CONFIG,
  NODE_ENVIRONS
} = require("../constants/index.constants");

const mongoose = require("mongoose");

// const { TEST, DEVELOPMENT, ENV } = NODE_ENVIRONS;
// const { MONGO_DEV_URL, MONGO_PROD_URL, MONGO_TEST_URL } = MONGO_CONFIG;
const { DATABASE_CONNECTED } = GENERIC_CONSOLE_MESSAGES;

const databaseURL =
  "mongodb+srv://prescryber_prod:prescryber@cluster0-6kzt2.mongodb.net/prescriber_prod?retryWrites=true&w=majority";

mongoose.connect(
  databaseURL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  },
  err => (err ? console.error(err.message) : null)
);

const database = mongoose.connection;

database.on("error", err => console.error(err.message));
database.on("open", () => console.info(DATABASE_CONNECTED));

module.exports = database;
