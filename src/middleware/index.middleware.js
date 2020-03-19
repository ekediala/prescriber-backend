const {
  JWT_SECRET,
  PRESCRIBER,
  RESPONSE_MESSAGES
} = require("../constants/index.constants");

const httpStatusCodes = require("http-status-codes");
const {
  BAD_GATEWAY,
  FORBIDDEN,
  NOT_FOUND,
  UNAUTHORIZED,
  UNPROCESSABLE_ENTITY
} = httpStatusCodes;
const {
  prescriptionSchema,
  updatePrescriptionSchema
} = require("../validators/prescription.validator");

const jwt = require("jsonwebtoken");
const prescriptionModel = require("../models/prescription.model");
const { userSchema } = require("../validators/user.validator");

const {
  PATIENT_NOT_ALLOWED,
  PRESCRIPTION_NOT_FOUND,
  FORBIDDEN_ACCESS_PRESCRIPTION,
  INVALID_TOKEN
} = RESPONSE_MESSAGES;
/**
 * Manages authorisation for our application users
 */
class AuthorisationMiddleware {
  /**
   * Watches out for expired tokens
   * @param {Object} req http request object
   * @param {Object} res http response object
   * @param {Object} next express next function
   */
  static verifyToken(req, res, next) {
    const token = req.headers["x-access-token"];
    // didn't send a token, reject request
    if (!token)
      return res
        .status(FORBIDDEN)
        .json({ message: httpStatusCodes.getStatusText(FORBIDDEN) });

    // sent token, check validity
    jwt.verify(token, JWT_SECRET, (err, data) => {
      // ah, token expired, sorry mate
      if (err) return res.status(UNAUTHORIZED).json({ message: INVALID_TOKEN });
      // token valid, get details of user and pass on to req object
      req.user = { ...data._doc };
      // move on to better things
      next();
    });
  }

  /**
   * Authorises prescribers to manage prescriptions
   * @param {Object} req http request object
   * @param {Object} res http response object
   * @param {Object} next express next function
   */
  static isPrescriber(req, res, next) {
    const { accountType } = req.user;
    accountType === PRESCRIBER
      ? next()
      : res.status(FORBIDDEN).json({ message: PATIENT_NOT_ALLOWED });
  }

  /**
   * Authorises only prescribers of a subscription to carry out operations
   * on the prescription
   * @param {Object} req http request object
   * @param {Object} res http response object
   * @param {Object} next express next function
   */
  static isCreator(req, res, next) {
    const {
      user: { email: userEmail }
    } = req;
    const { _id } = req.body;

    prescriptionModel.findById(_id, (err, prescription) => {
      if (err) return res.status(BAD_GATEWAY).json({ message: err.message });
      if (!prescription)
        return res.status(NOT_FOUND).json({ message: PRESCRIPTION_NOT_FOUND });

      // all good, this prescription does exist, check if current user is creator
      userEmail === prescription.prescriberEmail
        ? next()
        : res
            .status(FORBIDDEN)
            .json({ message: FORBIDDEN_ACCESS_PRESCRIPTION });
    });
  }

  /**
   * Validates user input when creating  a prescription
   * @param {Object} req http request object
   * @param {Object} res http response object
   * @param {Object} next express next function
   */
  static async prescriptionValidator(req, res, next) {
    try {
      const validInputs = await prescriptionSchema.validateAsync(req.body);
      req.body = validInputs;
      next();
    } catch ({ message }) {
      return res.status(UNPROCESSABLE_ENTITY).json({ message });
    }
  }

  /**
   * Validates user input when modifying a prescription
   * @param {Object} req http request object
   * @param {Object} res http response object
   * @param {Object} next express next function
   */
  static async updatePrescriptionValidator(req, res, next) {
    try {
      const validInputs = await updatePrescriptionSchema.validateAsync(
        req.body
      );
      req.body = validInputs;
      next();
    } catch ({ message }) {
      return res.status(UNPROCESSABLE_ENTITY).json({ message });
    }
  }

  /**
   * Validates user input when registering a new user
   * @param {Object} req http request object
   * @param {Object} res http response object
   * @param {Object} next express next function
   */
  static async registrationValidator(req, res, next) {
    try {
      const validInputs = await userSchema.validateAsync(req.body);
      req.body = validInputs;
      next();
    } catch ({ message }) {
      return res.status(UNPROCESSABLE_ENTITY).json({ message });
    }
  }

  /**
   * Authorises a user to view one prescription
   * User medical records are sacrosanct
   * @param {Object} req http request object
   * @param {Object} res http response object
   * @param {Object} next express next function
   */
  static async isAllowedToView(req, res, next) {
    const { _id } = req.params;
    const { email } = req.user;

    prescriptionModel.findById(_id, (err, prescription) => {
      if (err) return res.status(BAD_GATEWAY).json({ message: err.message });
      if (!prescription)
        return res.status(NOT_FOUND).json({ message: PRESCRIPTION_NOT_FOUND });

      // found your prescription, great, are you allowed to see this?
      const { patientEmail, prescriberEmail } = prescription;

      if (email === patientEmail || email === prescriberEmail)
        // 😃 OK, get well soon mate, I know you may be the prescriber. Idc 😃
        next();

      // urgh, you can't see this mate
      return res.status(FORBIDDEN).json({
        message: FORBIDDEN_ACCESS_PRESCRIPTION
      });
    });
  }
}

module.exports = AuthorisationMiddleware;
