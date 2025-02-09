const utilities = require("../utilities/");
const accountModel = require("../models/account-model");

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav();
    let message = req.flash("notice") || "";
    res.render("account/login", {
      title: "Login",
      nav,
      message,
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

  try {
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_password
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



module.exports = { buildLogin, buildRegister, registerAccount };
