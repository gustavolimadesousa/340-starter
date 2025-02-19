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
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
);

// Route for /account/logout
router.get(
  "/logout",
  utilities.handleErrors(accountController.accountLogout)
);

// GET route for account update form
router.get(
  "/update/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
);

// POST route to handle account updates
router.post(
  "/update/",
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccount)
);

// Account info update
router.post(
  "/update-info",
  utilities.checkLogin,
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccountInfo)
);

// Password update
router.post(
  "/update-password",
  utilities.checkLogin,
  regValidate.updatePasswordRules(),
  utilities.handleErrors(accountController.updatePassword)
);

module.exports = router;
