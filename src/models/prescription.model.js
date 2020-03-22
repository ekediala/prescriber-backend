const mongoose = require("mongoose"); 
const { Schema} = mongoose;

const { SCHEMA_NAMES }  = require("../constants/index.constants");

const { PRESCRIPTION } = SCHEMA_NAMES;

const prescriptionSchema = new Schema({
  prescriberName: {
    type: String,
    required: true
  },
  interval: {
    type: Number,
    required: true
  },
  prescription: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  furtherAdvice: String,
  patientName: {
    type: String,
    required: true
  },
  datePrescribed: {
    type: Date,
    default: new Date()
  },
  expectedDateEnd: {
    type: Date,
    default: new Date()
  },
  patientEmail: {
    type: String,
    required: true
  },
  filled: {
    type: Boolean,
    default: false
  },
  prescriberEmail: {
    type: String,
    required: true
  }
});

prescriptionSchema.add({
  verified: {
    type: Boolean,
    default: false
  }
});

const prescriptionModel = mongoose.model(PRESCRIPTION, prescriptionSchema);

module.exports = prescriptionModel;
