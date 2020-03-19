const Joi = require("@hapi/joi");

/**
 * The validation schema for creating new prescriptions
 * @constant
 */
exports.prescriptionSchema = Joi.object({
  interval: Joi.number().required(),
  prescription: Joi.string().required(),
  unit: Joi.string()
    .allow("ml", "capsules", "tablets")
    .required(),
  quantity: Joi.number().required(),
  furtherAdvice: Joi.string().required(),
  patientEmail: Joi.string()
    .email()
    .required(),
  expectedDateEnd: Joi.date()
});

/**
 * The validation schema for updating new prescriptions
 * @constant
 */
exports.updatePrescriptionSchema = Joi.object({
  interval: Joi.number().required(),
  prescription: Joi.string().required(),
  unit: Joi.string()
    .allow("ml", "capsules", "tablets")
    .required(),
  quantity: Joi.number().required(),
  furtherAdvice: Joi.string().required(),
  patientEmail: Joi.string()
    .email()
    .required(),
  expectedDateEnd: Joi.date(),
  _id: Joi.string().required(),
  __v: Joi.any(),
  datePrescribed: Joi.date(),
  patientName: Joi.string().required(),
  filled: Joi.boolean().required(),
  verified: Joi.boolean().required(),
  prescriberName: Joi.string().required(),
  prescriberEmail: Joi.string()
    .email()
    .required()
});
