const { DEFAULT_ACCOUNT_TYPE, SCHEMA_NAMES } = require("../constants/index.constants");
const mongoose = require("mongoose");

const { USER } = SCHEMA_NAMES;
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  accountType: {
    type: String,
    default: DEFAULT_ACCOUNT_TYPE
  },
  password: {
    type: String,
    required: true
  }
});


const userModel = mongoose.model(USER, userSchema);

module.exports = userModel;
