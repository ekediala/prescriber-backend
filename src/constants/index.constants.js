const dotenv = require("dotenv");
dotenv.config();

const {
  env: {
    PORT_NUMBER,
    NODE_ENV,
    MONGO_PROD_URL,
    MONGO_DEV_URL,
    MONGO_TEST_URL,
    JWT_SECRET_KEY,
    TWILIO_ACC_SID,
    TWILIO_TOKEN,
    TWILIO_PHONE,
    EMAIL_ID,
    EMAIL_PASSWORD
  }
} = process;

/**
 * Production node environment
 * @constant
 */
const PRODUCTION = "production";

/**
 * Development node environment
 * @constant
 */
const DEVELOPMENT = "development";

/**
 * Test node environment
 * @constant
 */
const TEST = "test";

/**
 * The object containing all our app's route strings
 * @constant
 */
exports.ROUTES = {
  GET_USER: "/user",
  HOME: "/",
  LOGIN: "/auth/login",
  PRESCRIPTION: "/prescription",
  REGISTER: "/auth/register",
  ONE_PRESCRIPTION: "/prescription/:_id",
  FILL_PRESCRIPTION: "/prescription/fill",
  PASSWORD_RESET_SEND: "/auth/password/send",
  PASSWORD_RESET: "/auth/password/reset",
  EMAIL_AVAILABLE: "/auth/check/:email",
  GET_PATIENT: "/user/check/:email"
};

/**
 * All response messages
 * @constant
 */
exports.RESPONSE_MESSAGES = {
  DELETE_SUCCESSFUL: "Resource has been successfully deleted",
  FORBIDDEN_ACCESS_PRESCRIPTION:
    "You are not allowed to carry out this action on a prescription",
  HOME_RESPONSE: "Welcome to Prescryber API",
  INCORRECT_PATIENT_EMAIL: "Incorrect patient email",
  INVALID_RESPONSE: "This API does not exist or it has been deprecated",
  PATIENT_NOT_ALLOWED: "Only prescribers are allowed to use this route",
  EMAIL_TAKEN: "Sorry, that email is taken",
  PRESCRIPTION_NOT_FOUND: "Sorry, seems that prescription has been removed.",
  SUCCESSFUL_PRESCRIPTION_CREATE: "Prescription created successfully",
  SUCCESSFUL_USER_REGISTRATION: "User registration successful",
  UPDATE_SUCCESSFUL: "Resource successfully updated",
  USER_NOT_FOUND: "Sorry, we couldn't find a user with the provided details",
  GENERIC_SUCCESS: "Successful operation",
  INVALID_TOKEN: "Session expired, please login again",
  PASSWORD_SENT: "Password sent to email address"
};

/**
 * App port number
 * @constant
 */
exports.PORT = PORT_NUMBER || 3000;

/**
 * Possible node environments
 * @constant
 */
exports.NODE_ENVIRONS = {
  DEVELOPMENT,
  ENV: NODE_ENV,
  PRODUCTION,
  TEST
};

/**
 * MongoDB database URLs
 * @constant
 */
exports.MONGO_CONFIG = {
  MONGO_DEV_URL,
  MONGO_PROD_URL,
  MONGO_TEST_URL
};

/**
 * Generic messages for logging information
 * @constant
 */
exports.GENERIC_CONSOLE_MESSAGES = {
  CONNECTION_FAILED: "Database connection failed",
  DATABASE_CONNECTED: "Database connection successful"
};

/**
 * Names for mongoose schemas
 * @constant
 */
exports.SCHEMA_NAMES = {
  USER: "User",
  PRESCRIPTION: "Prescription"
};

/**
 * Secret key for creating jwt tokens
 * @constant
 */
exports.JWT_SECRET = JWT_SECRET_KEY;

/**
 * Default account type
 * @constant
 */
exports.DEFAULT_ACCOUNT_TYPE = "patient";

/**
 * The account type for prescribers
 * @constant
 */
exports.PRESCRIBER = "prescriber";

/**
 * Twilio config data
 * @constant
 */
exports.TWILIO_CONFIG = {
  TWILIO_ACC_SID,
  TWILIO_TOKEN,
  TWILIO_PHONE
};

/**
 * Our app name
 * @constant
 */
exports.APP_NAME = "Prescryber";

/**
 * Our cron job time zone
 * @constant
 */
exports.CRON_CONFIG = {
  TIME_ZONE: "Africa/Lagos"
};

/**
 * API URsL for development and production
 * @constant
 */
const UI_URLS = {
  DEVELOPMENT: "http://localhost:8080",
  PRODUCTION: "https://prescryber.web.app"
};

/**
 * Our application url
 * @constant
 */
const APP_URL =
  NODE_ENV === DEVELOPMENT ? UI_URLS.DEVELOPMENT : UI_URLS.PRODUCTION;

exports.APP_URL = APP_URL;

/**
 * Password reset link
 * @constant
 */
exports.PASSWORD_RESET_LINK = `${APP_URL}/password/reset`;

/**
 * Email details
 * @constant
 */
exports.EMAIL_CONFIG = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_ID,
    pass: EMAIL_PASSWORD
  }
};
