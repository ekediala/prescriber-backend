const AuthorisationMiddleware = require("../middleware/index.middleware");
const HomeController = require("../controllers/home.controller");
const PrescriptionController = require("../controllers/prescription.controller");
const { ROUTES } = require("../constants/index.constants");
const { Router } = require("express");
const UserController = require("../controllers/user.controller");

const router = Router();

const {
  HOME,
  PRESCRIPTION,
  REGISTER,
  LOGIN,
  GET_USER,
  PASSWORD_RESET,
  PASSWORD_RESET_SEND,
  EMAIL_AVAILABLE,
  GET_PATIENT
} = ROUTES;

// index route
router.get(HOME, HomeController.index);

// auth routes
// login
router.post(LOGIN, UserController.login);
// send password reset code
router.post(PASSWORD_RESET_SEND, UserController.sendPasswordResetCode);
// reset password
router.post(
  PASSWORD_RESET,
  AuthorisationMiddleware.verifyToken,
  UserController.resetPassword
);
// check phone number user registering with is available
router.get(EMAIL_AVAILABLE, UserController.isEmailAvailable);
// register
router.post(
  REGISTER,
  AuthorisationMiddleware.registrationValidator,
  UserController.create
);

// prescription crud routes
// get all prescriptions belonging to a given user
router.get(
  PRESCRIPTION,
  AuthorisationMiddleware.verifyToken,
  UserController.index
);

// create prescription
router.post(
  PRESCRIPTION,
  AuthorisationMiddleware.verifyToken,
  AuthorisationMiddleware.isPrescriber,
  AuthorisationMiddleware.prescriptionValidator,
  PrescriptionController.create
);

// update prescription
router.patch(
  PRESCRIPTION,
  AuthorisationMiddleware.verifyToken,
  AuthorisationMiddleware.updatePrescriptionValidator,
  PrescriptionController.update
);

// delete prescription
router.delete(
  PRESCRIPTION,
  AuthorisationMiddleware.verifyToken,
  AuthorisationMiddleware.isPrescriber,
  AuthorisationMiddleware.isCreator,
  PrescriptionController.delete
);

// user routes
router.get(
  GET_USER,
  AuthorisationMiddleware.verifyToken,
  UserController.getUser
);

// get one patient
router.get(
  GET_PATIENT,
  AuthorisationMiddleware.verifyToken,
  AuthorisationMiddleware.isPrescriber,
  UserController.getPatientName
);

module.exports = router;
