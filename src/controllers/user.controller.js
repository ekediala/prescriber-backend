const httpStatusCode = require("http-status-codes");
const CONSTANTS = require("../constants/index.constants");
const {
  APP_URL,
  EMAIL_CONFIG,
  JWT_SECRET,
  PASSWORD_RESET_LINK,
  RESPONSE_MESSAGES
} = CONSTANTS;
const {
  BAD_GATEWAY,
  BAD_REQUEST,
  CREATED,
  NOT_FOUND,
  UNAUTHORIZED,
  UNPROCESSABLE_ENTITY
} = httpStatusCode;

const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { pick } = require("lodash");
const prescriptionModel = require('../models/prescription.model');
const userModel = require("../models/user.model");

const {
  EMAIL_TAKEN,
  USER_NOT_FOUND,
  GENERIC_SUCCESS,
  PASSWORD_SENT
} = RESPONSE_MESSAGES;

/**
 * Manages users of the application
 */
class UserController {
  /**
   * Creates a new user
   * @param {Object} req the http request object
   * @param {Object} res http the response object
   * @returns http response
   */
  static create(req, res) {
    const payload = pick(req.body, [
      "name",
      "email",
      "accountType",
      "password"
    ]);

    // verify if number is taken
    userModel.findOne({ email: payload.email }, async (err, user) => {
      if (err) return res.status(BAD_GATEWAY).json({ message: err.message });
      if (user)
        return res.status(UNPROCESSABLE_ENTITY).json({ message: EMAIL_TAKEN });

      // all good, number not taken create user
      try {
        // hash password mate, you cannot trust these things
        const hashedPassword = bcryptjs.hashSync(payload.password);
        payload.password = hashedPassword;
        // create user
        const user = await userModel.create(payload);
        // prepare response
        const data = UserController.prepareTokenisedResponse(user);
        return res.status(CREATED).json({ data });
      } catch ({ message }) {
        return res.status(BAD_REQUEST).json({ message });
      }
    });
  }

  /**
   * Prepares a response after signing in / up a user
   * @param {Object} user user to prepare token with
   * @returns {Object} response data with token
   */
  static prepareTokenisedResponse(user) {
    const { accountType, email, name } = user;
    // create token
    const token = jwt.sign({ ...user }, JWT_SECRET, {
      // we do not need unqualified people meddling with prescriptions
      expiresIn: "0.5h"
    });

    // we good mate, token created, send response to frontend ( and beer to dev ) thank you
    const data = {
      token,
      message: GENERIC_SUCCESS,
      accountType,
      email,
      name
    };

    return data;
  }

  /**
   * Log user in
   * @param {Object} req http request object
   * @param {Object} res http response object
   */
  static login(req, res) {
    const credentials = pick(req.body, ["email", "password"]);
    // authenticate user
    userModel.findOne({ email: credentials.email }, (err, user) => {
      if (err) return res.status(BAD_GATEWAY).json({ message: err.message });
      if (!user) return res.status(NOT_FOUND).json({ message: USER_NOT_FOUND });

      // all good, bless our future AI overlords
      const valid = bcryptjs.compareSync(credentials.password, user.password);

      // invalid password, duh!
      if (!valid)
        return res.status(UNAUTHORIZED).json({
          message: httpStatusCode.getStatusText(UNAUTHORIZED)
        });

      // 😀 prepare response
      const data = UserController.prepareTokenisedResponse(user);
      return res.json({ data });
    });
  }

  /**
   * Reset user password
   * @param {Object} req http request object
   * @param {Object} res http response object
   * @returns http response
   */
  static resetPassword(req, res) {
    const { password } = req.body;
    const { email } = req.user;
    const hashedPassword = bcryptjs.hashSync(password);
    userModel.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      async (err, user) => {
        if (err) return res.status(BAD_GATEWAY).json({ message: err.message });
        if (!user)
          return res.status(NOT_FOUND).json({ message: USER_NOT_FOUND });

        // password reset, send confirmation email
        const message = `<p>Your password has been successfully changes.</p>
      <p>Click <a href="${APP_URL}/login">here</a> to login</p>`;

        try {
          const transporter = nodemailer.createTransport(EMAIL_CONFIG);
          await transporter.sendMail({
            from: '"Prescryber" <prescriber@support.com>',
            to: user.email,
            subject: "Password Reset",
            html: message
          });
        } catch (error) {
          console.log(error); // we will decide how to handle this later
        }
        return res.json({ data: { message: GENERIC_SUCCESS } });
      }
    );
  }

  /**
   * Gets one user
   * @param {Object} req http request object
   * @param {Object} res http response object
   * @returns http response
   */
  static getUser(req, res) {
    const user = req.user;
    return res.json({ data: { user } });
  }

  /**
   * Fetches all users
   * @param {Object} req http request object
   * @param {Object} res http response object
   * @returns http response
   */
  static async index(req, res) {
    const { email } = req.user;
    try {
      const prescriptions = await prescriptionModel.find({
        $or: [{ patientEmail: email }, { prescriberEmail: email }]
      });
      return res.json({ data: { prescriptions } });
    } catch ({ message }) {
      return res.status(BAD_GATEWAY).json({ message });
    }
  }

  /**
   * Updates one user
   * @param {Object} req http request object
   * @param {Object} res http response object
   * @returns http response
   */
  static update(req, res) {
    userModel.findOneAndUpdate({ _id: req.user.id }, req.body, (err, user) => {
      if (err) return res.status(BAD_REQUEST).send(err.message);

      if (!user) return res.status(NOT_FOUND).send(user_NOT_FOUND);

      return res.json({ data: { user } });
    });
  }

  /**
   * Delete one user
   * @param {Object} req http request object
   * @param {Object} res http response object
   * @returns http response
   */
  static delete(req, res) {
    userModel.findOneAndDelete({ _id: req.user.id }, {}, (err, user) => {
      if (err) return res.status(BAD_REQUEST).json({ message: err.message });

      if (!user) return res.status(NOT_FOUND).json({ message: USER_NOT_FOUND });

      return res.json({ data: { user } });
    });
  }

  /**
   * Verify user
   * @param {Object} req http request object
   * @param {Object} res http response object
   * @returns http response
   */
  static async getPatientName(req, res) {
    let { email } = req.params;
    userModel.findOne({ email }, async (err, user) => {
      if (err) return res.status(BAD_GATEWAY).json({ message: err.message });
      if (!user) return res.status(NOT_FOUND).json({ message: USER_NOT_FOUND });
      // all good, send username baclk to frontend
      return res.json({ data: { name: user.name } });
    });
  }

  /**
   * Reset user password
   * @param {Object} req http request object
   * @param {Object} res http response object
   * @returns http response
   */
  static async sendPasswordResetCode(req, res) {
    let { email } = req.body;
    // check if user does exist
    userModel.findOne({ email }, async (err, user) => {
      if (err) return res.status(BAD_GATEWAY).json({ message: err.message });
      if (!user) return res.status(NOT_FOUND).json({ message: USER_NOT_FOUND });
      // all good, send password reset code
      const token = jwt.sign({ ...user }, JWT_SECRET, { expiresIn: "0.2h" });
      const message = `<p>A password change was requested for your account.</p>
      <p>If you did not request it, ignore this message.</p>
      <p>Click <a href="${PASSWORD_RESET_LINK}/${token}">here</a> to reset your password if you did</p>
      <p>Token expires in 10 minutes</p>`;

      try {
        const transporter = nodemailer.createTransport(EMAIL_CONFIG);
        await transporter.sendMail({
          from: '"Prescryber" <prescriber@support.com>',
          to: user.email,
          subject: "Password Reset",
          html: message
        });
        return res.json({ data: { message: PASSWORD_SENT } });
      } catch (error) {
        return res.status(BAD_REQUEST).json({ message: error.message });
      }
    });
  }

  /**
   * Verifies email is unused in app
   * @param {Object} req http request object
   * @param {Object} res http response object
   * @returns http response
   */
  static isEmailAvailable(req, res) {
    const { email } = req.params;
    userModel.findOne({ email }, (err, user) => {
      if (err) return res.status(BAD_GATEWAY).json({ message: err.message });
      // sorry, phone number not available
      if (user)
        return res.status(UNPROCESSABLE_ENTITY).json({ message: EMAIL_TAKEN });

      // all valid, continue
      return res.json({ data: { message: GENERIC_SUCCESS } });
    });
  }
}

module.exports = UserController ;
