const { DEFAULT_ACCOUNT_TYPE, PRESCRIBER } = require('../constants/index.constants');

const Joi = require('@hapi/joi');

/**
 * Schema for validating users
 * @constant
 */
exports.userSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    accountType: Joi.string().allow(DEFAULT_ACCOUNT_TYPE, PRESCRIBER).required(),
    password: Joi.string().alphanum().required()
});


