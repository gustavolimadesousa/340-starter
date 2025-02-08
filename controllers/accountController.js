const utilities = require("../utilities/");
const accountModel = require("../models/account-model");

/* ****************************************
 *  Deliver login view
 * *************************************** */

async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav();
    // Use an empty string as fallback if no message is set
    let message = req.flash("notice") || "";
    res.render("account/login", {
      title: "Login",
      nav,
      message, // Pass message to the view
    });
  } catch (err) {
    console.error("Error while building login page:", err);
    next(err); // Pass the error to the error handler
  }
}




/* ****************************************
 *  Deliver Register view
 * *************************************** */

async function buildRegister(req, res, next) {
  try {
    let nav = await utilities.getNav();
    let message = "";
    res.render("account/register", {
      title: "Register",
      nav,
      message,
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

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  );

  if (regResult) {
    // Set a flash message for successful registration
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    );

    // Redirect to login page after registration
    res.status(201).redirect("/account/login"); // Redirect to login page
  } else {
    // Set a flash message for failed registration
    req.flash("notice", "Sorry, the registration failed.");

    // Render the registration page again with the failure message
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    });
  }
}


module.exports = { buildLogin, buildRegister, registerAccount };
