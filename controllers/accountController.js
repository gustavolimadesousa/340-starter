const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const { validationResult } = require("express-validator"); // Import validationResult from express-validator
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav();
    let message = req.flash("notice") || ""; // Default to empty string if message is not set

    // Get validation errors
    let errors = validationResult(req);

    res.render("account/login", {
      title: "Login",
      nav,
      message: message, // Make sure message is passed to the view
      errors: errors.isEmpty() ? null : errors.array(), // Only pass errors if any exist
    });
  } catch (err) {
    console.error("Error while building login page:", err);
    next(err);
  }
}

/* ****************************************
 *  Deliver Register view
 * *************************************** */
async function buildRegister(req, res, next) {
  try {
    let nav = await utilities.getNav();
    let message = req.flash("notice"); // Certifica-se de pegar mensagens flash corretamente
    res.render("account/register", {
      title: "Register",
      nav,
      message: message.length > 0 ? message[0] : "", // Evita erro de variável indefinida
      errors: null,
    });
  } catch (err) {
    console.error("Error loading register page:", err);
    next(err);
  }
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // Hash the password with a salt (cost 10)
    hashedPassword = await bcrypt.hash(account_password, 10); // Hash password asynchronously
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  try {
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword // Use the hashed password instead of plain text
    );

    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      );
      return res.status(201).redirect("/account/login");
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return res.status(500).render("account/register", {
        title: "Registration",
        nav,
        message: "Sorry, the registration failed.",
        errors: null,
      });
    }
  } catch (err) {
    console.error("Error during registration:", err);
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      message: "An error occurred during registration.",
      errors: null,
    });
  }
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Deliver Account Management view
 * *************************************** */
async function buildAccountManagement(req, res, next) {
  try {
    let nav = await utilities.getNav();
    let message = req.flash("notice") || ""; // Mensagem flash opcional

    res.render("account/account-management", {
      title: "Account Management",
      nav,
      message,
      errors: null,
    });
  } catch (err) {
    console.error("Error while building account management page:", err);
    next(err);
  }
}

async function accountLogout(req, res, next) {
  try {
    res.clearCookie("jwt");
    res.redirect("/");
  } catch (error) {
    next(error);
  }
}

async function buildUpdateAccount(req, res, next) {
  try {
    const account_id = parseInt(req.params.account_id);
    const accountData = await accountModel.getAccountById(account_id);
    res.render("account/update-account", {
      title: "Update Account",
      nav: await utilities.getNav(),
      accountData,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Process Account Update
 * *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email } = req.body;

  // Validate input data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("account/update-account", {
      title: "Update Account",
      nav,
      accountData: {
        account_id,
        account_firstname,
        account_lastname,
        account_email
      },
      errors: errors.array(),
      messages: {
        error: req.flash("error"),
        success: req.flash("success")
      }
    });
  }

  try {
    // Update account in database
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    if (updateResult) {
      // Get updated account data
      const updatedAccount = await accountModel.getAccountById(account_id);

      // Generate new JWT with updated data
      const accessToken = jwt.sign(
        {
          account_id: updatedAccount.account_id,
          account_firstname: updatedAccount.account_firstname,
          account_lastname: updatedAccount.account_lastname,
          account_email: updatedAccount.account_email,
          account_type: updatedAccount.account_type
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      // Set updated cookie
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000
      });

      // Set success message and redirect
      req.flash("success", "Account information successfully updated");
      return res.redirect("/account/");
    } else {
      // Handle update failure
      req.flash("error", "Account update failed. Please try again.");
      return res.redirect(`/account/update/${account_id}`);
    }
  } catch (error) {
    console.error("Error during account update:", error);
    req.flash("error", "An error occurred during account update");
    return res.redirect(`/account/update/${account_id}`);
  }
}


/* ****************************************
 *  Update Account Information
 * *************************************** */
async function updateAccountInfo(req, res, next) {
  try {
    const { account_id, account_firstname, account_lastname, account_email } = req.body;
    
    // Server-side validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      return res.render("account/update-account", {
        title: "Update Account",
        nav,
        accountData: {
          account_id,
          account_firstname,
          account_lastname,
          account_email
        },
        errors: errors.array()
      });
    }

    // Update database
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    if (updateResult) {
      // Update JWT token with new data
      const accountData = await accountModel.getAccountById(account_id);
      const accessToken = jwt.sign(
        {
          account_id: accountData.account_id,
          account_firstname: accountData.account_firstname,
          account_lastname: accountData.account_lastname,
          account_email: accountData.account_email,
          account_type: accountData.account_type
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("jwt", accessToken, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000
      });

      req.flash("success", "Account information updated successfully");
      res.redirect("/account");
    }
  } catch (error) {
    req.flash("error", "Failed to update account information");
    res.redirect("/account/update");
  }
}

/* ****************************************
 *  Update Password
 * *************************************** */
async function updatePassword(req, res, next) {
  try {
    const { account_id, account_password } = req.body;
    
    // Server-side validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      return res.render("account/update-account", {
        title: "Update Account",
        nav,
        accountData: { account_id },
        errors: errors.array()
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(account_password, 10);

    // Update database
    const updateResult = await accountModel.updatePassword(
      account_id,
      hashedPassword
    );

    if (updateResult) {
      req.flash("success", "Password updated successfully");
      res.redirect("/account");
    }
  } catch (error) {
    req.flash("error", "Failed to update password");
    res.redirect("/account/update");
  }
}


module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  accountLogout,
  buildUpdateAccount,
  updateAccount,
  updateAccountInfo,
  updatePassword,
};

