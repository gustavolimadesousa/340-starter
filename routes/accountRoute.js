const express = require("express");
const router = express.Router();
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");

// Route for /account/login
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route for /account/register
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

// Route to register form submission
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

module.exports = router;
