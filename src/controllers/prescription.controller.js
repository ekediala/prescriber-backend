const HTTP_RESPONSES = require("http-status-codes");
const LODASH = require("lodash");
const MESSAGES = require("../constants/index.constants");
const prescriptionModel = require("../models/prescription.model");
const userModel = require("../models/user.model");

const { BAD_GATEWAY, CREATED, NOT_FOUND, OK } = HTTP_RESPONSES;
const { omit, pick } = LODASH;
const { RESPONSE_MESSAGES } = MESSAGES;

const {
  SUCCESSFUL_PRESCRIPTION_CREATE,
  INCORRECT_PATIENT_EMAIL,
  UPDATE_SUCCESSFUL,
  PRESCRIPTION_NOT_FOUND,
  DELETE_SUCCESSFUL
} = RESPONSE_MESSAGES;

/**
 * Manages prescriptions on our app
 */
class PrescriptionController {
  /**
   * Creates new prescriptions
   * @param {Object} req the http request object
   * @param {Object} res http the response object
   * @returns http response
   */
  static async create(req, res) {
    const payload = pick(req.body, [
      "furtherAdvice",
      "prescription",
      "expectedDateEnd",
      "interval",
      "unit",
      "quantity",
      "patientEmail"
    ]);

    // get prescriber's name and attach to request
    const { name, email } = req.user;
    payload.prescriberName = name;
    payload.prescriberEmail = email;

    // get patient's name and attach to payload
    userModel.findOne({ email: payload.patientEmail }, async (err, user) => {
      if (err) {
        return res.status(BAD_GATEWAY).json({ message: err.message });
      }
      if (!user) {
        return res.status(NOT_FOUND).json({ message: INCORRECT_PATIENT_EMAIL });
      }

      // patient found, extract name, append to payload
      const { name } = user;
      payload.patientName = name;

      // all is good, send request
      try {
        await prescriptionModel.create(payload);
        return res
          .status(CREATED)
          .json({ data: { message: SUCCESSFUL_PRESCRIPTION_CREATE }});
      } catch ({ message }) {
        return res.status(BAD_GATEWAY).json({ message });
      }
    });
  }

  /**
   * Fetches all prescriptions
   * @param {Object} req http request object
   * @param {Object} res http response object
   * @returns http response
   */
  static async index(req, res) {
    try {
      const prescriptions = await prescriptionModel.find();
      return res.json({ data: { prescriptions } });
    } catch ({ message }) {
      return res.status(BAD_GATEWAY).json({ message });
    }
  }

  /**
   * Updates one prescription
   * @param {Object} req http request object
   * @param {Object} res http response object
   * @returns http response
   */
  static update(req, res) {
    const payload = omit(req.body, "_id");

    prescriptionModel.findOneAndUpdate(
      { _id: req.body._id },
      payload,
      (err, prescription) => {
        if (err) {
          PrescriptionController.response.message = err.message;
          return res.status(BAD_GATEWAY).json({ message });
        }

        if (!prescription) {
          return res
            .status(NOT_FOUND)
            .json({ message: PRESCRIPTION_NOT_FOUND });
        }
        return res.json({ data: { prescription, message: UPDATE_SUCCESSFUL } });
      }
    );
  }

  /**
   * Delete one prescription
   * @param {Object} req http request object
   * @param {Object} res http response object
   * @returns http response
   */
  static delete(req, res) {
    // fetch prescription
    prescriptionModel.findOneAndDelete(
      { _id: req.body._id },
      (err, prescription) => {
        if (err) {
          PrescriptionController.response.message = err.message;
          return res.status(BAD_GATEWAY).json({ message });
        }

        if (!prescription) {
          return res.status(NOT_FOUND).json({ data: { message: PRESCRIPTION_NOT_FOUND } });
        }
        return res.json({data: {prescription, message: DELETE_SUCCESSFUL}});
      }
    );
  }
}

module.exports = PrescriptionController;
