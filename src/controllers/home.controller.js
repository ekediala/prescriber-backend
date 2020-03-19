const HTTP_RESPONSES = require("http-status-codes");
const MESSAGES = require("../constants/index.constants");

const { NOT_FOUND } = HTTP_RESPONSES;
const { RESPONSE_MESSAGES } = MESSAGES;

const { HOME_RESPONSE, INVALID_RESPONSE } = RESPONSE_MESSAGES;

class HomeController {
  /**
   * Handles all responses to app index
   * @param {Object} req the request object
   * @param {Object} res the response object
   */
  static index(req, res) {
    return res.send(HOME_RESPONSE);
  }

  static invalid(req, res) {
    return res.status(NOT_FOUND).send(INVALID_RESPONSE);
  }
}

module.exports = HomeController;
