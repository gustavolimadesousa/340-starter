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


// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Route for /account/
router.get("/", utilities.handleErrors(accountController.buildAccountManagement));

module.exports = router;
