const utilities = require(".");
const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model"); // Require the account model
const validate = {};

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
  return [
    // First name is required and must be a string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), // Error message if validation fails.

    // Last name is required and must be a string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."), // Error message if validation fails.

    // Valid email is required and cannot already exist in the database
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // Refer to validator.js documentation
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(
          account_email
        );
        if (emailExists) {
          throw new Error(
            "Email exists. Please log in or use a different email."
          );
        }
      }),

    // Password is required and must be a strong password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/* **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
  return [
    // Email validation: must be a valid email format
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),

    // Password validation: must meet certain security requirements (same as in registration)
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password does not meet the required strength (minimum 12 characters, one uppercase letter, one number, one special character)."
      ),
  ];
};

/* ******************************
 * Check data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email, account_password } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email, // Preserve entered email in case of errors
    });
    return;
  }
  next();
};

/* **********************************
 *  Update Account Validation Rules
 * ********************************* */
validate.updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("First name is required"),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Last name is required"),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required")
      .custom(async (account_email, { req }) => {
        const account = await accountModel.getAccountByEmail(account_email);
        // Check if email belongs to current user
        if (account && account.account_id !== parseInt(req.body.account_id)) {
          throw new Error("Email already exists. Please use a different email.");
        }
      })
  ];
};

/* ******************************
 * Check Update Data
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(req.body.account_id);
    
    res.render("account/update-account", {
      title: "Update Account",
      nav,
      accountData: {
        ...accountData,
        ...req.body // Preserve user input
      },
      errors: errors.array(),
    });
    return;
  }
  next();
};

// Add to existing validation
validate.updatePasswordRules = () => {
  return [
    body('account_password')
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
      })
      .withMessage('Password does not meet requirements'),
    
    body('confirm_password')
      .trim()
      .notEmpty()
      .custom((value, { req }) => value === req.body.account_password)
      .withMessage('Passwords do not match')
  ];
};


module.exports = {
  registrationRules: validate.registrationRules,
  checkRegData: validate.checkRegData,
  loginRules: validate.loginRules,
  checkLoginData: validate.checkLoginData,
  updateAccountRules: validate.updateAccountRules, 
  checkUpdateData: validate.checkUpdateData,
  updatePasswordRules: validate.updatePasswordRules,
};